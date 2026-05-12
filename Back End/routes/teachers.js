const express = require('express');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
 router.get('/:id', async (req, res) => {
  try {
     let teacher = await Teacher.findById(req.params.id);
     if (!teacher) {
      const user = await User.findById(req.params.id);
      if (user) {
        teacher = await Teacher.findOne({ email: user.email });
      }
    }
    if (!teacher) return res.status(404).json({ message: "Teacher record not found" });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teacher profile" });
  }
});
router.post('/', async (req, res) => {
  try {
    const { name, email, teacherId, department, status } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered.' });
    const existingTeacherId = await Teacher.findOne({ teacherId });
    if (existingTeacherId) return res.status(400).json({ message: 'Teacher ID already exists.' });
    const hashedPassword = await bcrypt.hash(teacherId, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role: 'teacher'
    });
    await newUser.save();
    const newTeacher = new Teacher({ name, email, teacherId, department, status });
    await newTeacher.save();
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating teacher' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { name, email, teacherId, department, status } = req.body;
    const oldTeacher = await Teacher.findById(req.params.id);
    if (!oldTeacher) return res.status(404).json({ message: "Teacher not found" });
    const duplicateId = await Teacher.findOne({ teacherId, _id: { $ne: req.params.id } });
    if (duplicateId) {
      return res.status(400).json({ message: 'This Teacher ID is already assigned to another teacher.' });
    }
    await User.findOneAndUpdate(
      { email: oldTeacher.email },
      { email, name },  
      { new: true }
    );
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { name, email, teacherId, department, status },
      { new: true }
    );
    res.json(updatedTeacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating' });
  }
});
 router.put('/:id/preferences', async (req, res) => {
  try {
    const { preferredCourses, availableTimes } = req.body;
    let teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
        const user = await User.findById(req.params.id);
        if (user) teacher = await Teacher.findOne({ email: user.email });
    }
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    if (preferredCourses !== undefined) teacher.preferredCourses = preferredCourses;
    if (availableTimes !== undefined) teacher.availableTimes = availableTimes;
    await teacher.save();
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Error saving preferences' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (teacher) {
      await User.findOneAndDelete({ email: teacher.email });
      await Teacher.findByIdAndDelete(req.params.id);
      res.json({ message: 'Teacher and account deleted' });
    } else {
      res.status(404).json({ message: 'Teacher not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;