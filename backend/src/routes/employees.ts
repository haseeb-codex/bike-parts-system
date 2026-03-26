const express = require('express');
const { auth, authorize } = require('@/middleware/auth');
const { validate } = require('@/middleware/validation');
const {
	createEmployee,
	getEmployees,
	getEmployeeById,
	updateEmployee,
	deleteEmployee,
} = require('@/controllers/employeeController');
const { createEmployeeSchema, updateEmployeeSchema } = require('@/validators/employeeValidators');

const router = express.Router();

router.get('/', auth, getEmployees);
router.get('/:id', auth, getEmployeeById);
router.post('/', auth, authorize('admin', 'manager'), validate(createEmployeeSchema), createEmployee);
router.put('/:id', auth, authorize('admin', 'manager'), validate(updateEmployeeSchema), updateEmployee);
router.delete('/:id', auth, authorize('admin'), deleteEmployee);

module.exports = router;
