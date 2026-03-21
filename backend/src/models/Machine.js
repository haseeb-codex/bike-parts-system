const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    type: { type: String, default: 'Injection Molding' },
    status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active', index: true },
    location: { type: String, default: 'Factory Floor' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Machine', machineSchema);
