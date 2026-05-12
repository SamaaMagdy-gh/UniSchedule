const mongoose = require('mongoose');
const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  teacherId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  status: { type: String, default: 'Active' },
  preferredCourses: [{ type: String }],
  availableTimes: [
    {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    }
  ]
}, { timestamps: true });
module.exports = mongoose.model('Teacher', teacherSchema);