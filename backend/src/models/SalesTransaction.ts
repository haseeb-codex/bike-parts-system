const mongoose = require('mongoose');

const salesTransactionSchema = new mongoose.Schema(
	{
		transactionNumber: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
		productCode: { type: String, required: true, trim: true, uppercase: true, index: true },
		quantity: { type: Number, required: true, min: 1 },
		unitPrice: { type: Number, required: true, min: 0 },
		totalAmount: { type: Number, required: true, min: 0, index: true },
		customerName: { type: String, required: true, trim: true },
		customerPhone: { type: String, default: '' },
		paymentMethod: { type: String, enum: ['cash', 'bank', 'credit'], default: 'cash', index: true },
		status: { type: String, enum: ['completed', 'cancelled'], default: 'completed', index: true },
		saleDate: { type: Date, required: true, index: true },
		notes: { type: String, default: '' },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('SalesTransaction', salesTransactionSchema);
