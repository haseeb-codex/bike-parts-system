const Joi = require('joi');

const utilityTypeSchema = Joi.string().valid('electricity', 'gas', 'water', 'internet', 'diesel', 'other');
const statusSchema = Joi.string().valid('pending', 'paid', 'overdue');

const createUtilitySchema = Joi.object({
  utilityType: utilityTypeSchema.required(),
  billingMonth: Joi.number().integer().min(1).max(12).required(),
  billingYear: Joi.number().integer().min(2000).max(2100).required(),
  meterReadingPrevious: Joi.number().min(0).default(0),
  meterReadingCurrent: Joi.number().min(0).default(0),
  unitsConsumed: Joi.number().min(0),
  unitCost: Joi.number().min(0).required(),
  totalAmount: Joi.number().min(0),
  billingDate: Joi.date().required(),
  dueDate: Joi.date().required(),
  status: statusSchema.default('pending'),
  vendorName: Joi.string().allow('').max(120).default(''),
  notes: Joi.string().allow('').max(500).default(''),
});

const updateUtilitySchema = Joi.object({
  utilityType: utilityTypeSchema,
  billingMonth: Joi.number().integer().min(1).max(12),
  billingYear: Joi.number().integer().min(2000).max(2100),
  meterReadingPrevious: Joi.number().min(0),
  meterReadingCurrent: Joi.number().min(0),
  unitsConsumed: Joi.number().min(0),
  unitCost: Joi.number().min(0),
  totalAmount: Joi.number().min(0),
  billingDate: Joi.date(),
  dueDate: Joi.date(),
  status: statusSchema,
  vendorName: Joi.string().allow('').max(120),
  notes: Joi.string().allow('').max(500),
}).min(1);

module.exports = {
  createUtilitySchema,
  updateUtilitySchema,
};
