const express = require('express');
const Course = require('../models/Course');
const router = express.Router();

const VALID_DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

function sanitizeSections(sections) {
  if (!sections || !Array.isArray(sections)) return [];
  return sections.map((sec, i) => ({
    ...sec,
    sectionName: sec.sectionName || `${(sec.type || 'Lecture') === 'Lecture' ? 'Lec' : 'Sec'} ${i + 1}`,
    day: VALID_DAYS.includes(sec.day) ? sec.day : VALID_DAYS[0],
    startTime: sec.startTime || '08:00',
    endTime: sec.endTime || '09:30',
    type: sec.type || 'Lecture',
    maxCapacity: sec.maxCapacity || 40,
    currentEnrollment: sec.currentEnrollment || 0
  }));
}

router.get('/', async (req, res) => {
  try {
    const data = await Course.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { code } = req.body;
    const existing = await Course.findOne({ code });
    if (existing) return res.status(400).json({ message: 'Course code already exists!' });

    req.body.sections = sanitizeSections(req.body.sections);

    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    console.error('[Courses POST] Error:', error.message);
    res.status(500).json({ message: error.message || 'Server error occurred' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (req.body.sections !== undefined) {
      req.body.sections = sanitizeSections(req.body.sections);
    }
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    console.error('[Courses PUT] Error:', error.message);
    res.status(500).json({ message: error.message || 'Update failed' });
  }
});

router.post('/reset-sections', async (req, res) => {
  try {

    await Course.updateMany({}, { $set: { sections: [] } });
    res.json({ message: 'All sections reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;