const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  isRegistrationOpen: { type: Boolean, default: false },
  isRequestsOpen: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
