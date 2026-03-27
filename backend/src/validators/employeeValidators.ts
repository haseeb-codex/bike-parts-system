const Joi = require('joi');

const statusSchema = Joi.string().valid('active', 'inactive');
const roleSchema = Joi.string().valid('admin', 'super_admin', 'employee');

const createEmployeeSchema = Joi.object({
	employeeCode: Joi.string().min(2).max(40).optional(),
	name: Joi.string().min(2).max(120).required(),
	role: roleSchema.optional(),
	phone: Joi.string().min(6).max(30).required(),
	email: Joi.string().email().required(),
	salary: Joi.number().greater(0).optional(),
	joiningDate: Joi.date().required(),
	status: statusSchema.default('active'),
	address: Joi.string().allow('').max(300).default(''),
	notes: Joi.string().allow('').max(500).default(''),
});

const updateEmployeeSchema = Joi.object({
	employeeCode: Joi.string().min(2).max(40),
	name: Joi.string().min(2).max(120),
	role: roleSchema.optional(),
	phone: Joi.string().min(6).max(30),
	email: Joi.string().email(),
	salary: Joi.number().greater(0),
	joiningDate: Joi.date(),
	status: statusSchema,
	address: Joi.string().allow('').max(300),
	notes: Joi.string().allow('').max(500),
}).min(1);

module.exports = {
	createEmployeeSchema,
	updateEmployeeSchema,
};
