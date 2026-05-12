const express = require('express');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const User = require('../models/User');
const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);
    if (!student) {
      const user = await User.findById(req.params.id);
      if (user) student = await Student.findOne({ email: user.email });
    }
    if (!student) return res.status(404).json({ message: "Student record not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student profile" });
  }
});
router.post('/', async (req, res) => {
  try {
    const { name, email, studentId, department, status, academicYear, major } = req.body;
     const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered.' });
     const existingStudentId = await Student.findOne({ studentId });
    if (existingStudentId) {
      return res.status(400).json({ message: 'Student ID already exists! Please use a unique ID.' });
    }
    const hashedPassword = await bcrypt.hash(studentId, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role: 'student'
    });
    await newUser.save();
    const newStudent = new Student({ name, email, studentId, department, status, academicYear, major });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating student' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { name, email, studentId, department, status, academicYear, major } = req.body;
    const oldStudent = await Student.findById(req.params.id);
    if (!oldStudent) return res.status(404).json({ message: "Student not found" });
     const duplicateId = await Student.findOne({ studentId, _id: { $ne: req.params.id } });
    if (duplicateId) {
      return res.status(400).json({ message: 'This Student ID is already assigned to another student.' });
    }
    await User.findOneAndUpdate(
      { email: oldStudent.email },
      { email, name },  
      { new: true }
    );
     const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, studentId, department, status, academicYear, major },
      { new: true }
    );
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating' });
  }
});
 router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (student) {
       await User.findOneAndDelete({ email: student.email });
      await Student.findByIdAndDelete(req.params.id);
      res.json({ message: 'Student and associated user account deleted' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting' });
  }
});
module.exports = router;