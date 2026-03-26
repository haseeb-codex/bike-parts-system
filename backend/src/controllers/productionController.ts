const mongoose = require('mongoose');
const ProductionRecord = require('@/models/ProductionRecord');
const logger = require('@/utils/logger');

function isValidObjectId(id) {
	return mongoose.Types.ObjectId.isValid(id);
}

function normalizeCode(value) {
	return value?.toUpperCase().trim();
}

async function createProductionRecord(req, res, next) {
	try {
		const payload = {
			...req.body,
			productionNumber: normalizeCode(req.body.productionNumber),
			productCode: normalizeCode(req.body.productCode),
			machineCode: normalizeCode(req.body.machineCode),
		};

		const existing = await ProductionRecord.findOne({ productionNumber: payload.productionNumber });
		if (existing) {
			return res.status(409).json({ success: false, message: 'Production number already exists' });
		}

		const record = await ProductionRecord.create(payload);
		logger.info('Production record created: %s', record.productionNumber);

		return res.status(201).json({
			success: true,
			message: 'Production record created successfully',
			data: record,
		});
	} catch (error) {
		return next(error);
	}
}

async function getProductionRecords(req, res, next) {
	try {
		const {
			productCode,
			machineCode,
			shift,
			status,
			fromDate,
			toDate,
			search,
			page = 1,
			limit = 20,
			sortBy = 'productionDate',
			order = 'desc',
		} = req.query;

		const query: any = {};

		if (productCode) query.productCode = normalizeCode(productCode);
		if (machineCode) query.machineCode = normalizeCode(machineCode);
		if (shift) query.shift = shift;
		if (status) query.status = status;

		if (fromDate || toDate) {
			query.productionDate = {};
			if (fromDate) query.productionDate.$gte = new Date(String(fromDate));
			if (toDate) query.productionDate.$lte = new Date(String(toDate));
		}

		if (search) {
			query.$or = [
				{ productionNumber: { $regex: search, $options: 'i' } },
				{ productCode: { $regex: search, $options: 'i' } },
				{ machineCode: { $regex: search, $options: 'i' } },
				{ operatorName: { $regex: search, $options: 'i' } },
			];
		}

		const pageNumber = Math.max(Number(page) || 1, 1);
		const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
		const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
		const sort = { [sortBy]: sortOrder };

		const [items, total] = await Promise.all([
			ProductionRecord.find(query).sort(sort).skip((pageNumber - 1) * pageSize).limit(pageSize),
			ProductionRecord.countDocuments(query),
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

async function getProductionRecordById(req, res, next) {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid production record id' });
		}

		const record = await ProductionRecord.findById(id);
		if (!record) {
			return res.status(404).json({ success: false, message: 'Production record not found' });
		}

		return res.status(200).json({ success: true, data: record });
	} catch (error) {
		return next(error);
	}
}

async function updateProductionRecord(req, res, next) {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid production record id' });
		}

		const updates = { ...req.body };
		if (updates.productionNumber) {
			updates.productionNumber = normalizeCode(updates.productionNumber);
			const duplicate = await ProductionRecord.findOne({
				productionNumber: updates.productionNumber,
				_id: { $ne: id },
			});
			if (duplicate) {
				return res.status(409).json({ success: false, message: 'Production number already exists' });
			}
		}

		if (updates.productCode) updates.productCode = normalizeCode(updates.productCode);
		if (updates.machineCode) updates.machineCode = normalizeCode(updates.machineCode);

		const record = await ProductionRecord.findByIdAndUpdate(id, updates, {
			returnDocument: 'after',
			runValidators: true,
		});

		if (!record) {
			return res.status(404).json({ success: false, message: 'Production record not found' });
		}

		logger.info('Production record updated: %s', record.productionNumber);
		return res.status(200).json({
			success: true,
			message: 'Production record updated successfully',
			data: record,
		});
	} catch (error) {
		return next(error);
	}
}

async function deleteProductionRecord(req, res, next) {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid production record id' });
		}

		const record = await ProductionRecord.findByIdAndDelete(id);
		if (!record) {
			return res.status(404).json({ success: false, message: 'Production record not found' });
		}

		logger.info('Production record deleted: %s', record.productionNumber);
		return res.status(200).json({ success: true, message: 'Production record deleted successfully' });
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	createProductionRecord,
	getProductionRecords,
	getProductionRecordById,
	updateProductionRecord,
	deleteProductionRecord,
};
