const Joi = require('joi');

const statusSchema = Joi.string().valid('received', 'cancelled');

const createPurchaseSchema = Joi.object({
  purchaseNumber: Joi.string().min(3).max(40).required(),
  materialCode: Joi.string().min(2).max(40).required(),
  quantity: Joi.number().min(1).required(),
  unitCost: Joi.number().min(0).required(),
  totalAmount: Joi.number().min(0),
  supplierName: Joi.string().min(2).max(120).required(),
  purchaseDate: Joi.date().required(),
  status: statusSchema.default('received'),
  notes: Joi.string().allow('').max(500).default(''),
});

const updatePurchaseSchema = Joi.object({
  supplierName: Joi.string().min(2).max(120),
  purchaseDate: Joi.date(),
  status: statusSchema,
  notes: Joi.string().allow('').max(500),
}).min(1);

module.exports = {
  createPurchaseSchema,
  updatePurchaseSchema,
};
