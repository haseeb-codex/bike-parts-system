const Joi = require('joi');

const movementTypeSchema = Joi.string().valid('in', 'out', 'adjustment');

const createInventorySchema = Joi.object({
  productCode: Joi.string().min(2).max(40).required(),
  productName: Joi.string().min(2).max(120).required(),
  quantityAvailable: Joi.number().min(0).required(),
  reorderLevel: Joi.number().min(0).default(0),
  location: Joi.string().max(100).default('Main Warehouse'),
  unit: Joi.string().max(20).default('pcs'),
});

const updateInventorySchema = Joi.object({
  productName: Joi.string().min(2).max(120),
  reorderLevel: Joi.number().min(0),
  location: Joi.string().max(100),
  unit: Joi.string().max(20),
}).min(1);

const adjustInventorySchema = Joi.object({
  type: movementTypeSchema.required(),
  quantity: Joi.number().min(1).required(),
  reason: Joi.string().max(200).default(''),
  reference: Joi.string().max(80).allow('').default(''),
});

module.exports = {
  createInventorySchema,
  updateInventorySchema,
  adjustInventorySchema,
};
