const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  instructorName: { type: String, default: '' },
  courseRating: { type: Number, min: 1, max: 5, required: true },
  instructorRating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '', maxlength: 500 },
}, { timestamps: true });

 reviewSchema.index({ student: 1, courseCode: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
