const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  academicYear: { type: String },
  major: { type: String },
  creditHours: { type: Number, default: 3 },
  sections: [{
    sectionName: { type: String, required: true },
    type: { type: String, enum: ['Lecture', 'Section'], default: 'Lecture' },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    instructor: { type: String, default: '' }, 
    room: { type: String, default: '' },
    maxCapacity: { type: Number, required: true, default: 40 },
    currentEnrollment: { type: Number, default: 0 }
  }],
  status: { type: String, default: 'Active' }
}, { timestamps: true });
module.exports = mongoose.model('Course', courseSchema);