const mongoose = require('mongoose');
const Employee = require('@/models/Employee');
const logger = require('@/utils/logger');

function isValidObjectId(id) {
	return mongoose.Types.ObjectId.isValid(id);
}

function normalizeEmployeePayload(payload) {
	return {
		...payload,
		employeeCode: payload.employeeCode?.toUpperCase().trim(),
		email: payload.email?.toLowerCase().trim(),
	};
}

async function createEmployee(req, res, next) {
	try {
		const payload = normalizeEmployeePayload(req.body);

		const [codeExists, emailExists] = await Promise.all([
			Employee.findOne({ employeeCode: payload.employeeCode }),
			Employee.findOne({ email: payload.email }),
		]);

		if (codeExists) {
			return res.status(409).json({ success: false, message: 'Employee code already exists' });
		}

		if (emailExists) {
			return res.status(409).json({ success: false, message: 'Employee email already exists' });
		}

		const employee = await Employee.create(payload);
		logger.info('Employee created: %s', employee.employeeCode);

		return res.status(201).json({
			success: true,
			message: 'Employee created successfully',
			data: employee,
		});
	} catch (error) {
		return next(error);
	}
}

async function getEmployees(req, res, next) {
	try {
		const {
			department,
			status,
			search,
			page = 1,
			limit = 20,
			sortBy = 'createdAt',
			order = 'desc',
		} = req.query;

		const query: any = {};

		if (department) query.department = department;
		if (status) query.status = status;

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ employeeCode: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
				{ designation: { $regex: search, $options: 'i' } },
			];
		}

		const pageNumber = Math.max(Number(page) || 1, 1);
		const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
		const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
		const sort = { [sortBy]: sortOrder };

		const [items, total] = await Promise.all([
			Employee.find(query).sort(sort).skip((pageNumber - 1) * pageSize).limit(pageSize),
			Employee.countDocuments(query),
		]);

		return res.status(200).json({
			success: true,
			data: items,
			meta: {
				total,
				page: pageNumber,
				limit: pageSize,
				totalPages: Math.ceil(total / pageSize),
			},
		});
	} catch (error) {
		return next(error);
	}
}

async function getEmployeeById(req, res, next) {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid employee id' });
		}

		const employee = await Employee.findById(id);
		if (!employee) {
			return res.status(404).json({ success: false, message: 'Employee not found' });
		}

		return res.status(200).json({ success: true, data: employee });
	} catch (error) {
		return next(error);
	}
}

async function updateEmployee(req, res, next) {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid employee id' });
		}

		const updates = normalizeEmployeePayload(req.body);

		if (updates.employeeCode) {
			const duplicateCode = await Employee.findOne({
				employeeCode: updates.employeeCode,
				_id: { $ne: id },
			});
			if (duplicateCode) {
				return res.status(409).json({ success: false, message: 'Employee code already exists' });
			}
		}

		if (updates.email) {
			const duplicateEmail = await Employee.findOne({
				email: updates.email,
				_id: { $ne: id },
			});
			if (duplicateEmail) {
				return res.status(409).json({ success: false, message: 'Employee email already exists' });
			}
		}

		const employee = await Employee.findByIdAndUpdate(id, updates, {
			returnDocument: 'after',
			runValidators: true,
		});

		if (!employee) {
			return res.status(404).json({ success: false, message: 'Employee not found' });
		}

		logger.info('Employee updated: %s', employee.employeeCode);
		return res.status(200).json({
			success: true,
			message: 'Employee updated successfully',
			data: employee,
		});
	} catch (error) {
		return next(error);
	}
}

async function deleteEmployee(req, res, next) {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid employee id' });
		}

		const employee = await Employee.findByIdAndDelete(id);
		if (!employee) {
			return res.status(404).json({ success: false, message: 'Employee not found' });
		}

		logger.info('Employee deleted: %s', employee.employeeCode);
		return res.status(200).json({ success: true, message: 'Employee deleted successfully' });
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	createEmployee,
	getEmployees,
	getEmployeeById,
	updateEmployee,
	deleteEmployee,
};
