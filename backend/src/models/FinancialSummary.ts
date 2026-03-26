const mongoose = require('mongoose');

const financialSummarySchema = new mongoose.Schema(
	{
		periodMonth: { type: Number, required: true, min: 1, max: 12, index: true },
		periodYear: { type: Number, required: true, min: 2000, max: 2100, index: true },
		totalSales: { type: Number, required: true, min: 0, default: 0 },
		totalPurchases: { type: Number, required: true, min: 0, default: 0 },
		totalUtilities: { type: Number, required: true, min: 0, default: 0 },
		grossProfit: { type: Number, required: true, default: 0 },
		netProfit: { type: Number, required: true, default: 0 },
		notes: { type: String, default: '' },
	},
	{ timestamps: true }
);

financialSummarySchema.index({ periodMonth: 1, periodYear: 1 }, { unique: true });

module.exports = mongoose.model('FinancialSummary', financialSummarySchema);
