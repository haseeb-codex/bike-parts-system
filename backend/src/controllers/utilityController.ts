const mongoose = require('mongoose');
const Utility = require('@/models/Utility');
const logger = require('@/utils/logger');

function isValidObjectId(id) {
	return mongoose.Types.ObjectId.isValid(id);
}

function buildComputedFields(payload: any, fallback: any = {}) {
	const previous = Number(payload.meterReadingPrevious ?? fallback.meterReadingPrevious ?? 0);
	const current = Number(payload.meterReadingCurrent ?? fallback.meterReadingCurrent ?? 0);
	const unitCost = Number(payload.unitCost ?? fallback.unitCost ?? 0);

	if (current < previous) {
		return { error: 'Current meter reading cannot be less than previous meter reading' };
	}

	const unitsConsumed = Number(payload.unitsConsumed ?? current - previous);
	const totalAmount = Number(payload.totalAmount ?? unitsConsumed * unitCost);

	return {
		meterReadingPrevious: previous,
		meterReadingCurrent: current,
		unitsConsumed,
		unitCost,
		totalAmount,
	};
}

async function createUtility(req, res, next) {
	try {
		const computed = buildComputedFields(req.body);
		if (computed.error) {
			return res.status(400).json({ success: false, message: computed.error });
		}

		const utility = await Utility.create({
			...req.body,
			...computed,
		});

		logger.info('Utility bill created: %s/%s %s', utility.billingMonth, utility.billingYear, utility.utilityType);
		return res.status(201).json({
			success: true,
			message: 'Utility record created successfully',
			data: utility,
		});
	} catch (error) {
		return next(error);
	}
}

async function getUtilities(req, res, next) {
	try {
		const {
			utilityType,
			status,
			billingMonth,
			billingYear,
			search,
			page = 1,
			limit = 20,
			sortBy = 'billingDate',
			order = 'desc',
		} = req.query;

		const query: any = {};

		if (utilityType) query.utilityType = utilityType;
		if (status) query.status = status;
		if (billingMonth) query.billingMonth = Number(billingMonth);
		if (billingYear) query.billingYear = Number(billingYear);

		if (search) {
			query.$or = [
				{ vendorName: { $regex: search, $options: 'i' } },
				{ notes: { $regex: search, $options: 'i' } },
			];
		}

		const pageNumber = Math.max(Number(page) || 1, 1);
		const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
		const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
		const sort = { [sortBy]: sortOrder };

		const [items, total] = await Promise.all([
			Utility.find(query).sort(sort).skip((pageNumber - 1) * pageSize).limit(pageSize),
			Utility.countDocuments(query),
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

async function getUtilityById(req, res, next) {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid utility id' });
		}

		const utility = await Utility.findById(id);
		if (!utility) {
			return res.status(404).json({ success: false, message: 'Utility record not found' });
		}

		return res.status(200).json({ success: true, data: utility });
	} catch (error) {
		return next(error);
	}
}

async function updateUtility(req, res, next) {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid utility id' });
		}

		const existing = await Utility.findById(id);
		if (!existing) {
			return res.status(404).json({ success: false, message: 'Utility record not found' });
		}

		const computed = buildComputedFields(req.body, existing);
		if (computed.error) {
			return res.status(400).json({ success: false, message: computed.error });
		}

		const utility = await Utility.findByIdAndUpdate(
			id,
			{
				...req.body,
				...computed,
			},
			{ returnDocument: 'after', runValidators: true }
		);

		logger.info('Utility bill updated: %s', utility._id.toString());
		return res.status(200).json({
			success: true,
			message: 'Utility record updated successfully',
			data: utility,
		});
	} catch (error) {
		return next(error);
	}
}

async function deleteUtility(req, res, next) {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid utility id' });
		}

		const utility = await Utility.findByIdAndDelete(id);
		if (!utility) {
			return res.status(404).json({ success: false, message: 'Utility record not found' });
		}

		logger.info('Utility bill deleted: %s', utility._id.toString());
		return res.status(200).json({ success: true, message: 'Utility record deleted successfully' });
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	createUtility,
	getUtilities,
	getUtilityById,
	updateUtility,
	deleteUtility,
};
