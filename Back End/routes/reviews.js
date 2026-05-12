const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/authMiddleware');

 router.post('/', auth, async (req, res) => {
  try {
    const { courseCode, courseName, instructorName, courseRating, instructorRating, comment } = req.body;
    if (!courseCode || !courseRating || !instructorRating) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const existing = await Review.findOne({ student: req.user.userId, courseCode });

    if (existing) {
       existing.courseRating = courseRating;
      existing.instructorRating = instructorRating;
      existing.comment = comment || '';
      existing.instructorName = instructorName || '';
      await existing.save();
      return res.json({ message: 'Review updated successfully.', review: existing });
    }

    const review = new Review({
      student: req.user.userId,
      courseCode,
      courseName,
      instructorName: instructorName || '',
      courseRating,
      instructorRating,
      comment: comment || '',
    });
    await review.save();
    res.status(201).json({ message: 'Review submitted successfully.', review });
  } catch (error) {
    console.error('Review POST error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

 router.get('/my', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ student: req.user.userId });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

 router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied.' });

    const reviews = await Review.find().populate('student', 'name email');

     const map = {};
    for (const r of reviews) {
      if (!map[r.courseCode]) {
        map[r.courseCode] = {
          courseCode: r.courseCode,
          courseName: r.courseName,
          instructorName: r.instructorName,
          totalReviews: 0,
          avgCourseRating: 0,
          avgInstructorRating: 0,
          reviews: [],
        };
      }
      map[r.courseCode].totalReviews++;
      map[r.courseCode].avgCourseRating += r.courseRating;
      map[r.courseCode].avgInstructorRating += r.instructorRating;
      map[r.courseCode].reviews.push({
        studentName: r.student?.name || 'Unknown',
        courseRating: r.courseRating,
        instructorRating: r.instructorRating,
        comment: r.comment,
        date: r.createdAt,
      });
    }

    const result = Object.values(map).map(entry => ({
      ...entry,
      avgCourseRating: parseFloat((entry.avgCourseRating / entry.totalReviews).toFixed(1)),
      avgInstructorRating: parseFloat((entry.avgInstructorRating / entry.totalReviews).toFixed(1)),
    }));

    res.json(result);
  } catch (error) {
    console.error('Reviews GET all error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
