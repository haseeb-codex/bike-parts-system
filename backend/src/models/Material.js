const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['PP', 'ABS', 'PE', 'PC', 'POM'], required: true, index: true },
    unit: { type: String, default: 'kg' },
    quantityInStock: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
    unitCost: { type: Number, default: 0, min: 0 },
    supplierName: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);
