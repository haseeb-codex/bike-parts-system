const Joi = require('joi');

const paymentMethodSchema = Joi.string().valid('cash', 'bank', 'credit');
const statusSchema = Joi.string().valid('completed', 'cancelled');

const createSalesSchema = Joi.object({
	transactionNumber: Joi.string().min(3).max(40).required(),
	productCode: Joi.string().min(2).max(40).required(),
	quantity: Joi.number().min(1).required(),
	unitPrice: Joi.number().min(0).required(),
	totalAmount: Joi.number().min(0),
	customerName: Joi.string().min(2).max(120).required(),
	customerPhone: Joi.string().allow('').max(40).default(''),
	paymentMethod: paymentMethodSchema.default('cash'),
	status: statusSchema.default('completed'),
	saleDate: Joi.date().required(),
	notes: Joi.string().allow('').max(500).default(''),
});

const updateSalesSchema = Joi.object({
	customerName: Joi.string().min(2).max(120),
	customerPhone: Joi.string().allow('').max(40),
	paymentMethod: paymentMethodSchema,
	status: statusSchema,
	saleDate: Joi.date(),
	notes: Joi.string().allow('').max(500),
}).min(1);

module.exports = {
	createSalesSchema,
	updateSalesSchema,
};
