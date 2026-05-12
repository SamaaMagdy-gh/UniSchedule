const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const SystemSettings = require('../models/SystemSettings');
const auth = require('../middleware/authMiddleware');

 router.get('/status', async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({ isRequestsOpen: false });
    }
    res.json({ isRequestsOpen: settings.isRequestsOpen });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching status' });
  }
});

 router.post('/toggle-status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({ isRequestsOpen: true });
    } else {
      settings.isRequestsOpen = !settings.isRequestsOpen;
    }
    await settings.save();
    res.json({ isRequestsOpen: settings.isRequestsOpen });
  } catch (error) {
    res.status(500).json({ message: 'Server error toggling status' });
  }
});

 router.get('/', async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('student', 'name email studentId')
      .populate('course', 'name code')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

 router.get('/student/:id', async (req, res) => {
  try {
    const requests = await Request.find({ student: req.params.id })
      .populate('course', 'name code')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

 router.post('/', async (req, res) => {
  try {
    const settings = await SystemSettings.findOne();
    if (!settings || !settings.isRequestsOpen) {
      return res.status(400).json({ message: 'The Add/Drop requests window is currently closed.' });
    }

    const { student, course, type, message } = req.body;
    
     const existing = await Request.findOne({ student, course, status: 'Pending' });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this course.' });
    }

    const request = new Request({ student, course, type, message });
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating request' });
  }
});

const Student = require('../models/Student');
const Course = require('../models/Course');

function timeToMinutes(timeStr) {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

 router.put('/:id', async (req, res) => {
  try {
    const { status, adminReply, selectedSections } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const studentUser = await require('../models/User').findById(request.student);
    if (!studentUser) return res.status(404).json({ message: 'Student user not found' });

    const student = await Student.findOne({ email: studentUser.email });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const course = await Course.findById(request.course);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (status === 'Approved') {
      if (request.type === 'Drop') {
        const toDrop = student.registeredSchedule.filter(item => item.courseId.toString() === course._id.toString());
        
        for (let item of toDrop) {
          await Course.updateOne(
            { _id: item.courseId, "sections._id": item.sectionId },
            { $inc: { "sections.$.currentEnrollment": -1 } }
          );
        }
        
        student.registeredSchedule = student.registeredSchedule.filter(item => item.courseId.toString() !== course._id.toString());
        await student.save();
      } else if (request.type === 'Add') {
        if (!selectedSections || selectedSections.length === 0) {
          return res.status(400).json({ message: 'Selected sections are required for an Add request.' });
        }

        const newScheduleItems = selectedSections.map(secId => ({
          courseId: course._id,
          sectionId: secId
        }));

        for (let item of newScheduleItems) {
          const sec = course.sections.id(item.sectionId);
          if (!sec) return res.status(404).json({ message: 'Section not found' });
          if (sec.currentEnrollment >= sec.maxCapacity) {
            return res.status(400).json({ message: `Section ${sec.sectionName} is full.` });
          }
        }

        const existingItemsForCourse = student.registeredSchedule.filter(item => item.courseId.toString() === course._id.toString());
        if (existingItemsForCourse.length > 0) {
          return res.status(400).json({ message: 'Student is already enrolled in this course.' });
        }

        const allStudentSections = [];
        for (let item of student.registeredSchedule) {
           const c = await Course.findById(item.courseId);
           if (c) {
             const s = c.sections.id(item.sectionId);
             if (s) allStudentSections.push({ day: s.day, startTime: s.startTime, endTime: s.endTime });
           }
        }

        for (let secId of selectedSections) {
           const s = course.sections.id(secId);
           allStudentSections.push({ day: s.day, startTime: s.startTime, endTime: s.endTime });
        }

        for (let i = 0; i < allStudentSections.length; i++) {
          for (let j = i + 1; j < allStudentSections.length; j++) {
            if (allStudentSections[i].day === allStudentSections[j].day) {
              const start1 = timeToMinutes(allStudentSections[i].startTime);
              const end1 = timeToMinutes(allStudentSections[i].endTime);
              const start2 = timeToMinutes(allStudentSections[j].startTime);
              const end2 = timeToMinutes(allStudentSections[j].endTime);
              if (Math.max(start1, start2) < Math.min(end1, end2)) {
                 return res.status(400).json({ message: 'Time conflict detected with the student\'s existing schedule.' });
              }
            }
          }
        }

        for (let item of newScheduleItems) {
          await Course.updateOne(
            { _id: item.courseId, "sections._id": item.sectionId },
            { $inc: { "sections.$.currentEnrollment": 1 } }
          );
        }

        student.registeredSchedule.push(...newScheduleItems);
        await student.save();
      }
    }

    request.status = status;
    request.adminReply = adminReply;
    await request.save();

    res.json(request);
  } catch (error) {
    console.error('[Request PUT Error]', error);
    res.status(500).json({ message: 'Server error updating request' });
  }
});

module.exports = router;
