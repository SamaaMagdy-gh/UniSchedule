const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Course = require('../models/Course');
router.get('/stats', async (req, res) => {
  try {
    const [studentCount, teacherCount, roomCount, courseCount] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Room.countDocuments(),
      Course.countDocuments()
    ]);
    const latestStudents = await Student.find().sort({ createdAt: -1 }).limit(5);
    const latestTeachers = await Teacher.find().sort({ createdAt: -1 }).limit(5);
    const latestCourses = await Course.find().sort({ createdAt: -1 }).limit(5);
    const latestRooms = await Room.find().sort({ createdAt: -1 }).limit(5);
    const activities = [
      latestStudents.map(s => ({ id: s._id, msg: `New student ${s.name} was added to ${s.department}`, date: s.createdAt })),
      latestTeachers.map(t => ({ id: t._id, msg: `New teacher ${t.name} was added to ${t.department}`, date: t.createdAt })),
      latestCourses.map(c => ({ id: c._id, msg: `New course ${c.name} was added to ${c.department}`, date: c.createdAt })),
      latestRooms.map(r => ({ id: r._id, msg: `New room ${r.name} was added to the system`, date: r.createdAt }))
    ];
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({
      stats: {
        students: studentCount,
        teachers: teacherCount,
        rooms: roomCount,
        courses: courseCount
      },
      recentActivity: activities.slice(0, 6)
    });
  } catch (error) {
    res.status(500).json({ message: 'Dashboard data error' });
  }
});
module.exports = router;