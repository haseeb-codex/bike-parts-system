const mongoose = require('mongoose');

const inventoryMovementSchema = new mongoose.Schema(
	{
		inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true, index: true },
		productCode: { type: String, required: true, trim: true, uppercase: true, index: true },
		type: { type: String, enum: ['in', 'out', 'adjustment'], required: true, index: true },
		quantity: { type: Number, required: true, min: 1 },
		previousQuantity: { type: Number, required: true, min: 0 },
		newQuantity: { type: Number, required: true, min: 0 },
		reason: { type: String, default: '' },
		reference: { type: String, default: '' },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('InventoryMovement', inventoryMovementSchema);
