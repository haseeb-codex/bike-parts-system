const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema(
	{
		purchaseNumber: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
		materialCode: { type: String, required: true, trim: true, uppercase: true, index: true },
		quantity: { type: Number, required: true, min: 1 },
		unitCost: { type: Number, required: true, min: 0 },
		totalAmount: { type: Number, required: true, min: 0, index: true },
		supplierName: { type: String, required: true, trim: true, index: true },
		purchaseDate: { type: Date, required: true, index: true },
		status: { type: String, enum: ['received', 'cancelled'], default: 'received', index: true },
		notes: { type: String, default: '' },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
