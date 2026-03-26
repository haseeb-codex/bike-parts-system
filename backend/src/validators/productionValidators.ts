const Joi = require('joi');

const shiftSchema = Joi.string().valid('morning', 'evening', 'night');
const statusSchema = Joi.string().valid('planned', 'in-progress', 'completed', 'halted');

const createProductionSchema = Joi.object({
	productionNumber: Joi.string().min(3).max(40).required(),
	productCode: Joi.string().min(2).max(40).required(),
	machineCode: Joi.string().min(2).max(40).required(),
	shift: shiftSchema.required(),
	quantityProduced: Joi.number().min(1).required(),
	quantityRejected: Joi.number().min(0).default(0),
	productionDate: Joi.date().required(),
	operatorName: Joi.string().min(2).max(100).required(),
	status: statusSchema.default('completed'),
	notes: Joi.string().allow('').max(500).default(''),
});

const updateProductionSchema = Joi.object({
	productionNumber: Joi.string().min(3).max(40),
	productCode: Joi.string().min(2).max(40),
	machineCode: Joi.string().min(2).max(40),
	shift: shiftSchema,
	quantityProduced: Joi.number().min(1),
	quantityRejected: Joi.number().min(0),
	productionDate: Joi.date(),
	operatorName: Joi.string().min(2).max(100),
	status: statusSchema,
	notes: Joi.string().allow('').max(500),
}).min(1);

module.exports = {
	createProductionSchema,
	updateProductionSchema,
};
