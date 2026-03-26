const mongoose = require('mongoose');

const productionRecordSchema = new mongoose.Schema(
	{
		productionNumber: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
		productCode: { type: String, required: true, trim: true, uppercase: true, index: true },
		machineCode: { type: String, required: true, trim: true, uppercase: true, index: true },
		shift: { type: String, enum: ['morning', 'evening', 'night'], required: true, index: true },
		quantityProduced: { type: Number, required: true, min: 1 },
		quantityRejected: { type: Number, default: 0, min: 0 },
		productionDate: { type: Date, required: true, index: true },
		operatorName: { type: String, required: true, trim: true },
		status: { type: String, enum: ['planned', 'in-progress', 'completed', 'halted'], default: 'completed', index: true },
		notes: { type: String, default: '' },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('ProductionRecord', productionRecordSchema);
