const Joi = require('joi');

const materialType = Joi.string().valid('PP', 'ABS', 'PE', 'PC', 'POM');

const createMaterialSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  code: Joi.string().min(2).max(40).required(),
  type: materialType.required(),
  unit: Joi.string().min(1).max(20).default('kg'),
  quantityInStock: Joi.number().min(0).default(0),
  reorderLevel: Joi.number().min(0).default(0),
  unitCost: Joi.number().min(0).default(0),
  supplierName: Joi.string().allow('').max(120).default(''),
});

const updateMaterialSchema = Joi.object({
  name: Joi.string().min(2).max(120),
  code: Joi.string().min(2).max(40),
  type: materialType,
  unit: Joi.string().min(1).max(20),
  quantityInStock: Joi.number().min(0),
  reorderLevel: Joi.number().min(0),
  unitCost: Joi.number().min(0),
  supplierName: Joi.string().allow('').max(120),
}).min(1);

module.exports = {
  createMaterialSchema,
  updateMaterialSchema,
};
