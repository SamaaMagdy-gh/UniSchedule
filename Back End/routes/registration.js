const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Course = require('../models/Course');
const Student = require('../models/Student');
const SystemSettings = require('../models/SystemSettings');

function timeToMinutes(timeStr) {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function hasOverlap(schedule) {
  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      if (schedule[i].day === schedule[j].day) {
        const start1 = timeToMinutes(schedule[i].startTime);
        const end1 = timeToMinutes(schedule[i].endTime);
        const start2 = timeToMinutes(schedule[j].startTime);
        const end2 = timeToMinutes(schedule[j].endTime);

        if (Math.max(start1, start2) < Math.min(end1, end2)) {
          return true;
        }
      }
    }
  }
  return false;
}

const VALID_DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

function sanitizeDay(day) {
  if (!day) return VALID_DAYS[0];

  const normalized = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  return VALID_DAYS.includes(normalized) ? normalized : VALID_DAYS[0];
}

function buildCourseChoices(course, studentSchedule = []) {
  const isEnrolled = (secId) => studentSchedule.some(ss => ss.sectionId.toString() === secId.toString());

  const originalTypes = new Set(course.sections.map(s => s.type || 'Lecture'));
  const availableLec = course.sections.filter(s => (s.type || 'Lecture') === 'Lecture' && ((s.currentEnrollment || 0) < (s.maxCapacity || 0) || isEnrolled(s._id)));
  const availableSec = course.sections.filter(s => s.type === 'Section' && ((s.currentEnrollment || 0) < (s.maxCapacity || 0) || isEnrolled(s._id)));

  const currentAvailableTypes = new Set();
  if (availableLec.length > 0) currentAvailableTypes.add('Lecture');
  if (availableSec.length > 0) currentAvailableTypes.add('Section');

  if (currentAvailableTypes.size < originalTypes.size) {
    console.log(`[Generator]   ! Course ${course.code} BLOCKED: Missing one or more component types (Available: ${[...currentAvailableTypes]}, Needs: ${[...originalTypes]})`);
    return [];
  }

  const makeItem = (sec) => ({
    courseId: course._id,
    courseCode: course.code,
    courseName: course.name,
    sectionId: sec._id,
    sectionName: sec.sectionName,
    type: sec.type || 'Lecture',
    day: sanitizeDay(sec.day),
    startTime: sec.startTime,
    endTime: sec.endTime,
    room: sec.room || '',
    instructor: sec.instructor || '',
    maxCapacity: sec.maxCapacity || 0,
    currentEnrollment: sec.currentEnrollment || 0
  });

  const combos = [];
  if (availableLec.length > 0 && availableSec.length > 0) {
    for (const lec of availableLec) {
      for (const sec of availableSec) {
        combos.push([makeItem(lec), makeItem(sec)]);
      }
    }
  } else if (availableLec.length > 0) {
    for (const lec of availableLec) {
      combos.push([makeItem(lec)]);
    }
  } else if (availableSec.length > 0) {
    for (const sec of availableSec) {
      combos.push([makeItem(sec)]);
    }
  }
  return combos;
}

function generateSchedules(courseChoices, index, currentSchedule, validSchedules) {
  if (index === courseChoices.length) {
    if (!hasOverlap(currentSchedule)) {
      validSchedules.push([...currentSchedule]);
    }
    return;
  }

  const choices = courseChoices[index];

  for (const combo of choices) {
    currentSchedule.push(...combo);
    generateSchedules(courseChoices, index + 1, currentSchedule, validSchedules);
    currentSchedule.splice(currentSchedule.length - combo.length, combo.length);
  }
}

 router.get('/status', async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({ isRegistrationOpen: false });
    }
    res.json({ isRegistrationOpen: settings.isRegistrationOpen });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/toggle-status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({ isRegistrationOpen: true });
    } else {
      settings.isRegistrationOpen = !settings.isRegistrationOpen;
    }
    await settings.save();
    res.json({ isRegistrationOpen: settings.isRegistrationOpen });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/generate-options', auth, async (req, res) => {
  try {
    const settings = await SystemSettings.findOne();
    if (!settings || !settings.isRegistrationOpen) {
      return res.status(400).json({ message: 'Registration is currently closed' });
    }

    const student = await Student.findOne({ email: req.user.email });
    console.log(`[Generator] Looking up student: ${req.user.email}`);

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found. Ask admin to create your student record.' });
    }

     if (!student.academicYear) {
      console.log(`[Generator] BLOCKED: Student ${student.name} has no Academic Year assigned.`);
      return res.json({ 
        schedules: [], 
        totalCourses: 0, 
        blocked: true,
        message: 'Your academic level is not set. Please contact the administrator to update your profile.' 
      });
    }

    let query = { academicYear: student.academicYear };
    if (student.major) query.major = student.major;

    const courses = await Course.find(query);
    console.log(`[Generator] Found ${courses.length} courses for Level: ${student.academicYear}`);

    if (!courses.length) {
      return res.json({ 
        schedules: [], 
        totalCourses: 0, 
        blocked: true,
        message: 'No courses found for your academic level. Please contact Student Affairs to resolve this.' 
      });
    }

    const courseChoices = [];
    const missingCourses = [];
    const fullCourses = [];

    courses.forEach(c => {
      const choices = buildCourseChoices(c, student.registeredSchedule || []);

      c.sections.forEach(s => {
        const sanitized = sanitizeDay(s.day);
        const dayLabel = s.day !== sanitized ? `"${s.day}" → "${sanitized}" (FIXED)` : `"${sanitized}"`;
        console.log(`[Generator]     ${s.sectionName} [${s.type || 'Lecture'}] ${dayLabel} ${s.startTime}-${s.endTime}`);
      });
      console.log(`[Generator]   - ${c.code}: ${choices.length} combos`);

      if (choices.length === 0) {

        const totalSections = c.sections ? c.sections.length : 0;
        if (totalSections === 0) {
          missingCourses.push(`${c.code}`);
        } else {
          fullCourses.push(`${c.code}`);
        }
      }
      courseChoices.push(choices);
    });

    if (missingCourses.length > 0 || fullCourses.length > 0) {
      const problems = [...missingCourses, ...fullCourses];
      console.log(`[Generator] BLOCKED: ${problems.length} courses have no available sections.`);
      return res.json({ 
        schedules: [], 
        totalCourses: courses.length,
        blocked: true,
        message: `We couldn't generate a complete schedule for you because some mandatory courses are fully booked. Please contact Student Affairs for assistance.`
      });
    }

    const validSchedules = [];
    generateSchedules(courseChoices, 0, [], validSchedules);

    console.log(`[Generator] Generated ${validSchedules.length} valid combinations from ${courses.length} courses.`);

    if (validSchedules.length === 0) {
      return res.json({
        schedules: [],
        totalCourses: courses.length,
        blocked: true,
        message: `We couldn't generate a complete schedule due to unavoidable time conflicts. Please contact Student Affairs for assistance.`
      });
    }

    const finalSchedules = validSchedules.map(sch => {
        let minLeft = Infinity;
        sch.forEach(item => {
            const left = Math.max(0, (item.maxCapacity || 0) - (item.currentEnrollment || 0));
            if (left < minLeft) minLeft = left;
        });
        return {
            schedule: sch,
            registrationsLeft: minLeft === Infinity ? 0 : minLeft
        };
    });

    res.json({ schedules: finalSchedules, totalCourses: courses.length });
  } catch (error) {
    console.error('[Generator] CRASH:', error);
    res.status(500).json({ message: 'Server error during generation' });
  }
});

router.post('/register', auth, async (req, res) => {
  try {
    const settings = await SystemSettings.findOne();
    if (!settings || !settings.isRegistrationOpen) {
      return res.status(400).json({ message: 'Registration is currently closed' });
    }

    const { schedule } = req.body;
    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
      return res.status(400).json({ message: 'Invalid schedule format' });
    }

    const cleanSchedule = schedule.map(item => ({
      courseId: item.courseId,
      sectionId: item.sectionId
    }));

    const student = await Student.findOne({ email: req.user.email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const oldSchedule = student.registeredSchedule || [];

    const toLeave = oldSchedule.filter(o => 
        !cleanSchedule.find(n => n.courseId.toString() === o.courseId.toString() && n.sectionId.toString() === o.sectionId.toString())
    );

    const toEnter = cleanSchedule.filter(n => 
        !oldSchedule.find(o => o.courseId.toString() === n.courseId.toString() && o.sectionId.toString() === n.sectionId.toString())
    );

    for (const item of toEnter) {
      const course = await Course.findById(item.courseId);
      if (!course) return res.status(404).json({ message: `Course ${item.courseId} not found` });
      const sec = course.sections.id(item.sectionId);
      if (!sec) return res.status(404).json({ message: "Section not found" });

      if (sec.currentEnrollment >= sec.maxCapacity) {
        return res.status(400).json({ message: `Registration failed: Section "${sec.sectionName}" of course ${course.code} is now full.` });
      }
    }

    for (const item of toLeave) {
        await Course.updateOne(
            { _id: item.courseId, "sections._id": item.sectionId },
            { $inc: { "sections.$.currentEnrollment": -1 } }
        );
    }

    for (const item of toEnter) {
        await Course.updateOne(
            { _id: item.courseId, "sections._id": item.sectionId },
            { $inc: { "sections.$.currentEnrollment": 1 } }
        );
    }

    student.registeredSchedule = cleanSchedule;
    await student.save();

    res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('[Register] CRASH:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.get('/my-schedule', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    if (!student || !student.registeredSchedule || student.registeredSchedule.length === 0) {
      return res.json([]);
    }

    const detailed = [];
    for (let item of student.registeredSchedule) {
      const course = await Course.findById(item.courseId);
      if (course) {
        const sec = course.sections.id(item.sectionId);
        if (sec) {
          detailed.push({
            courseCode: course.code,
            courseName: course.name,
            type: sec.type || 'Lecture',
            day: sanitizeDay(sec.day),
            startTime: sec.startTime,
            endTime: sec.endTime,
            room: sec.room || 'TBA',
            instructor: sec.instructor || 'TBA',
            sectionName: sec.sectionName
          });
        }
      }
    }
    res.json(detailed);
  } catch (err) {
    console.error('[MySchedule] CRASH:', err);
    res.status(500).json({ message: 'Error fetching schedule' });
  }
});

router.post('/reset', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    await Course.updateMany({}, { 
      $set: { "sections.$[].currentEnrollment": 0 } 
    });

    await Student.updateMany({}, { 
      $set: { registeredSchedule: [] } 
    });

    res.json({ message: 'All registrations have been reset successfully' });
  } catch (err) {
    console.error('[Reset] CRASH:', err);
    res.status(500).json({ message: 'Error resetting registrations' });
  }
});

router.get('/student-schedule/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const student = await Student.findById(req.params.id);
    if (!student || !student.registeredSchedule || student.registeredSchedule.length === 0) {
      return res.json([]);
    }

    const detailed = [];
    for (let item of student.registeredSchedule) {
      const course = await Course.findById(item.courseId);
      if (course) {
        const sec = course.sections.id(item.sectionId);
        if (sec) {
          detailed.push({
            courseCode: course.code,
            courseName: course.name,
            type: sec.type || 'Lecture',
            day: sanitizeDay(sec.day),
            startTime: sec.startTime,
            endTime: sec.endTime,
            room: sec.room || 'TBA',
            instructor: sec.instructor || 'TBA',
            sectionName: sec.sectionName
          });

        }
      }
    }
    res.json(detailed);
  } catch (err) {
    console.error('[AdminViewSchedule] CRASH:', err);
    res.status(500).json({ message: 'Error fetching student schedule' });
  }
});

router.delete('/clear-student-schedule/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (student.registeredSchedule.length === 0) {
      return res.json({ message: 'Student has no active registration to clear.' });
    }

    const registrationToClear = [...student.registeredSchedule];

    for (const item of registrationToClear) {
      try {
        await Course.updateOne(
          { _id: item.courseId, "sections._id": item.sectionId },
          { $inc: { "sections.$.currentEnrollment": -1 } }
        );
      } catch (err) {
        console.warn(`[ClearStudentReg] Failed to decrement for course ${item.courseId}:`, err.message);
      }
    }

    student.registeredSchedule = [];
    await student.save();

    res.json({ message: 'Student registration cleared successfully' });
  } catch (err) {
    console.error('[ClearStudentReg] CRASH:', err);
    res.status(500).json({ message: `Error: ${err.message}` });
  }
});

module.exports = router;
