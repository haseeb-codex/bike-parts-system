const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
	{
		productCode: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
		productName: { type: String, required: true, trim: true, index: true },
		quantityAvailable: { type: Number, required: true, default: 0, min: 0 },
		reorderLevel: { type: Number, default: 0, min: 0 },
		location: { type: String, default: 'Main Warehouse' },
		unit: { type: String, default: 'pcs' },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
