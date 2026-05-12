const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  academicYear: { type: String }, 
  major: { type: String },
  registeredSchedule: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    sectionId: { type: String }
  }],
  status: { type: String, default: 'Active' }
}, { timestamps: true });
module.exports = mongoose.model('Student', studentSchema);