const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
	{
		employeeCode: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
		name: { type: String, required: true, trim: true, index: true },
		department: { type: String, required: true, trim: true, index: true },
		designation: { type: String, required: true, trim: true },
		phone: { type: String, required: true, trim: true },
		email: { type: String, required: true, trim: true, lowercase: true, index: true },
		salary: { type: Number, required: true, min: 0 },
		joiningDate: { type: Date, required: true, index: true },
		status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
		address: { type: String, default: '' },
		notes: { type: String, default: '' },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
