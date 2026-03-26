const Joi = require('joi');

const statusSchema = Joi.string().valid('active', 'inactive');

const createEmployeeSchema = Joi.object({
	employeeCode: Joi.string().min(2).max(40).required(),
	name: Joi.string().min(2).max(120).required(),
	department: Joi.string().min(2).max(80).required(),
	designation: Joi.string().min(2).max(80).required(),
	phone: Joi.string().min(6).max(30).required(),
	email: Joi.string().email().required(),
	salary: Joi.number().min(0).required(),
	joiningDate: Joi.date().required(),
	status: statusSchema.default('active'),
	address: Joi.string().allow('').max(300).default(''),
	notes: Joi.string().allow('').max(500).default(''),
});

const updateEmployeeSchema = Joi.object({
	employeeCode: Joi.string().min(2).max(40),
	name: Joi.string().min(2).max(120),
	department: Joi.string().min(2).max(80),
	designation: Joi.string().min(2).max(80),
	phone: Joi.string().min(6).max(30),
	email: Joi.string().email(),
	salary: Joi.number().min(0),
	joiningDate: Joi.date(),
	status: statusSchema,
	address: Joi.string().allow('').max(300),
	notes: Joi.string().allow('').max(500),
}).min(1);

module.exports = {
	createEmployeeSchema,
	updateEmployeeSchema,
};
