const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    bikeModel: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    sellingPrice: { type: Number, default: 0, min: 0 },
    currentStock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
