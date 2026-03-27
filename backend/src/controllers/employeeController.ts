const mongoose = require('mongoose');
const User = require('@/models/User');
const logger = require('@/utils/logger');

function isValidObjectId(id) {
	return mongoose.Types.ObjectId.isValid(id);
}

function normalizeRole(role) {
	if (!role) {
		return 'employee';
	}

	const normalized = String(role).toLowerCase().trim();
	if (normalized === 'super admin') {
		return 'super_admin';
	}

	if (['admin', 'super_admin', 'employee'].includes(normalized)) {
		return normalized;
	}

	return 'employee';
}

function normalizeEmployeePayload(payload) {
	return {
		...payload,
		employeeCode: payload.employeeCode?.toUpperCase().trim(),
		role: normalizeRole(payload.role),
		email: payload.email?.toLowerCase().trim(),
	};
}

function toEmployeeResponse(user) {
	return {
		_id: user._id,
		employeeCode: user.employeeCode,
		name: user.name,
		role: normalizeRole(user.role),
		phone: user.phone || '',
		email: user.email,
		salary: user.salary ?? 0,
		joiningDate: user.joiningDate || user.createdAt,
		status: user.isActive ? 'active' : 'inactive',
		address: user.address || '',
		notes: user.notes || '',
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}

function generateTemporaryPassword() {
	return `Temp@${Math.random().toString(36).slice(-10)}A1`;
}

async function generateEmployeeCode() {
	for (let attempt = 0; attempt < 10; attempt += 1) {
		const randomPart = Math.floor(1000 + Math.random() * 9000);
		const employeeCode = `EMP-${randomPart}`;
		const exists = await User.exists({ employeeCode });
		if (!exists) {
			return employeeCode;
		}
	}

	return `EMP-${Date.now().toString().slice(-6)}`;
}

async function createEmployee(req, res, next) {
	try {
		const payload = normalizeEmployeePayload(req.body);
		if (!payload.employeeCode) {
			payload.employeeCode = await generateEmployeeCode();
		}
		payload.role = normalizeRole(payload.role);

		const temporaryPassword = generateTemporaryPassword();

		const [codeExists, emailExists] = await Promise.all([
			User.findOne({ employeeCode: payload.employeeCode }),
			User.findOne({ email: payload.email }),
		]);

		if (codeExists) {
			return res.status(409).json({ success: false, message: 'Employee code already exists' });
		}

		if (emailExists) {
			return res.status(409).json({ success: false, message: 'Employee email already exists' });
		}

		const user = await User.create({
			name: payload.name,
			email: payload.email,
			password: temporaryPassword,
			role: payload.role,
			employeeCode: payload.employeeCode,
			phone: payload.phone,
			salary: payload.salary,
			joiningDate: payload.joiningDate,
			isActive: payload.status !== 'inactive',
			address: payload.address || '',
			notes: payload.notes || '',
		});

		logger.info('Employee created in users collection: %s', user.employeeCode);

		return res.status(201).json({
			success: true,
			message: 'Employee created successfully',
			data: toEmployeeResponse(user),
		});
	} catch (error) {
		return next(error);
	}
}

async function getEmployees(req, res, next) {
	try {
		const {
			role,
			status,
			search,
			page = 1,
			limit = 20,
			sortBy = 'createdAt',
			order = 'desc',
		} = req.query;

		const query: any = {};
		query.role = { $in: ['admin', 'super_admin', 'employee'] };

		if (role) query.role = role;
		if (status) query.isActive = status === 'active';

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ employeeCode: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
				{ role: { $regex: search, $options: 'i' } },
			];
		}

		const pageNumber = Math.max(Number(page) || 1, 1);
		const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
		const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
		const sort = { [sortBy]: sortOrder };

		const [items, total] = await Promise.all([
			User.find(query).sort(sort).skip((pageNumber - 1) * pageSize).limit(pageSize),
			User.countDocuments(query),
		]);

		const normalizedItems = items.map((item) => toEmployeeResponse(item));

		return res.status(200).json({
			success: true,
			data: normalizedItems,
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

		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ success: false, message: 'Employee not found' });
		}

		return res.status(200).json({
			success: true,
			data: toEmployeeResponse(user),
		});
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
		updates.role = updates.role ? normalizeRole(updates.role) : undefined;

		if (updates.employeeCode) {
			const duplicateCode = await User.findOne({
				employeeCode: updates.employeeCode,
				_id: { $ne: id },
			});
			if (duplicateCode) {
				return res.status(409).json({ success: false, message: 'Employee code already exists' });
			}
		}

		if (updates.email) {
			const duplicateEmail = await User.findOne({
				email: updates.email,
				_id: { $ne: id },
			});
			if (duplicateEmail) {
				return res.status(409).json({ success: false, message: 'Employee email already exists' });
			}
		}

		const patch: any = {
			name: updates.name,
			email: updates.email,
			role: updates.role,
			employeeCode: updates.employeeCode,
			phone: updates.phone,
			salary: updates.salary,
			joiningDate: updates.joiningDate,
			address: updates.address,
			notes: updates.notes,
		};

		if (updates.status) {
			patch.isActive = updates.status === 'active';
		}

		Object.keys(patch).forEach((key) => {
			if (patch[key] === undefined) {
				delete patch[key];
			}
		});

		const user = await User.findByIdAndUpdate(id, patch, {
			returnDocument: 'after',
			runValidators: true,
		});

		if (!user) {
			return res.status(404).json({ success: false, message: 'Employee not found' });
		}

		logger.info('Employee(updated user) code: %s', user.employeeCode);
		return res.status(200).json({
			success: true,
			message: 'Employee updated successfully',
			data: toEmployeeResponse(user),
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

		const user = await User.findByIdAndDelete(id);
		if (!user) {
			return res.status(404).json({ success: false, message: 'Employee not found' });
		}

		logger.info('Employee(user) deleted: %s', user.employeeCode);
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
