const mongoose = require('mongoose');

const utilitySchema = new mongoose.Schema(
	{
		utilityType: {
			type: String,
			enum: ['electricity', 'gas', 'water', 'internet', 'diesel', 'other'],
			required: true,
			index: true,
		},
		billingMonth: { type: Number, required: true, min: 1, max: 12, index: true },
		billingYear: { type: Number, required: true, min: 2000, max: 2100, index: true },
		meterReadingPrevious: { type: Number, default: 0, min: 0 },
		meterReadingCurrent: { type: Number, default: 0, min: 0 },
		unitsConsumed: { type: Number, required: true, min: 0 },
		unitCost: { type: Number, required: true, min: 0 },
		totalAmount: { type: Number, required: true, min: 0, index: true },
		billingDate: { type: Date, required: true, index: true },
		dueDate: { type: Date, required: true, index: true },
		status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending', index: true },
		vendorName: { type: String, default: '' },
		notes: { type: String, default: '' },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Utility', utilitySchema);
