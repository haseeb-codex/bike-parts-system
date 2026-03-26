const Joi = require('joi');

const createFinancialSummarySchema = Joi.object({
  periodMonth: Joi.number().integer().min(1).max(12).required(),
  periodYear: Joi.number().integer().min(2000).max(2100).required(),
  totalSales: Joi.number().min(0),
  totalPurchases: Joi.number().min(0),
  totalUtilities: Joi.number().min(0),
  grossProfit: Joi.number(),
  netProfit: Joi.number(),
  notes: Joi.string().allow('').max(500).default(''),
});

const updateFinancialSummarySchema = Joi.object({
  totalSales: Joi.number().min(0),
  totalPurchases: Joi.number().min(0),
  totalUtilities: Joi.number().min(0),
  grossProfit: Joi.number(),
  netProfit: Joi.number(),
  notes: Joi.string().allow('').max(500),
}).min(1);

module.exports = {
  createFinancialSummarySchema,
  updateFinancialSummarySchema,
};
