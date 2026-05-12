const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  type: { type: String, default: 'Lecture Hall' },
  status: { type: String, default: 'Available' }
}, { timestamps: true });
module.exports = mongoose.model('Room', roomSchema);