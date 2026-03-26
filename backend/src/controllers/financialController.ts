const mongoose = require('mongoose');
const FinancialSummary = require('@/models/FinancialSummary');
const SalesTransaction = require('@/models/SalesTransaction');
const PurchaseOrder = require('@/models/PurchaseOrder');
const Utility = require('@/models/Utility');
const logger = require('@/utils/logger');

function isValidObjectId(id) {
	return mongoose.Types.ObjectId.isValid(id);
}

function monthDateRange(month, year) {
	const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
	const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
	return { start, end };
}

async function calculateFinancialMetrics(month, year) {
	const { start, end } = monthDateRange(month, year);

	const [salesAgg, purchaseAgg, utilityAgg] = await Promise.all([
		SalesTransaction.aggregate([
			{ $match: { saleDate: { $gte: start, $lte: end }, status: 'completed' } },
			{ $group: { _id: null, total: { $sum: '$totalAmount' } } },
		]),
		PurchaseOrder.aggregate([
			{ $match: { purchaseDate: { $gte: start, $lte: end }, status: 'received' } },
			{ $group: { _id: null, total: { $sum: '$totalAmount' } } },
		]),
		Utility.aggregate([
			{ $match: { billingDate: { $gte: start, $lte: end } } },
			{ $group: { _id: null, total: { $sum: '$totalAmount' } } },
		]),
	]);

	const totalSales = salesAgg[0]?.total || 0;
	const totalPurchases = purchaseAgg[0]?.total || 0;
	const totalUtilities = utilityAgg[0]?.total || 0;
	const grossProfit = totalSales - totalPurchases;
	const netProfit = grossProfit - totalUtilities;

	return {
		periodMonth: month,
		periodYear: year,
		totalSales,
		totalPurchases,
		totalUtilities,
		grossProfit,
		netProfit,
	};
}

async function getCurrentFinancialSummary(req, res, next) {
	try {
		const now = new Date();
		const month = Number(req.query.month || now.getUTCMonth() + 1);
		const year = Number(req.query.year || now.getUTCFullYear());

		const summary = await calculateFinancialMetrics(month, year);
		return res.status(200).json({ success: true, data: summary });
	} catch (error) {
		return next(error);
	}
}

async function createFinancialSummary(req, res, next) {
	try {
		const { periodMonth, periodYear } = req.body;

		const existing = await FinancialSummary.findOne({ periodMonth, periodYear });
		if (existing) {
			return res.status(409).json({ success: false, message: 'Financial summary already exists for this period' });
		}

		const calculated = await calculateFinancialMetrics(periodMonth, periodYear);
		const payload = {
			...calculated,
			...req.body,
			grossProfit: Number(req.body.grossProfit ?? calculated.grossProfit),
			netProfit: Number(req.body.netProfit ?? calculated.netProfit),
		};

		const summary = await FinancialSummary.create(payload);
		logger.info('Financial summary created for %d/%d', periodMonth, periodYear);

		return res.status(201).json({
			success: true,
			message: 'Financial summary created successfully',
			data: summary,
		});
	} catch (error) {
		return next(error);
	}
}

async function getFinancialSummaries(req, res, next) {
	try {
		const { periodMonth, periodYear, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;
		const query: any = {};

		if (periodMonth) query.periodMonth = Number(periodMonth);
		if (periodYear) query.periodYear = Number(periodYear);

		const pageNumber = Math.max(Number(page) || 1, 1);
		const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
		const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
		const sort = { [sortBy]: sortOrder };

		const [items, total] = await Promise.all([
			FinancialSummary.find(query).sort(sort).skip((pageNumber - 1) * pageSize).limit(pageSize),
			FinancialSummary.countDocuments(query),
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

async function getFinancialSummaryById(req, res, next) {
	try {
		const { id } = req.params;
		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid financial summary id' });
		}

		const summary = await FinancialSummary.findById(id);
		if (!summary) {
			return res.status(404).json({ success: false, message: 'Financial summary not found' });
		}

		return res.status(200).json({ success: true, data: summary });
	} catch (error) {
		return next(error);
	}
}

async function updateFinancialSummary(req, res, next) {
	try {
		const { id } = req.params;
		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid financial summary id' });
		}

		const summary = await FinancialSummary.findByIdAndUpdate(id, req.body, {
			returnDocument: 'after',
			runValidators: true,
		});

		if (!summary) {
			return res.status(404).json({ success: false, message: 'Financial summary not found' });
		}

		logger.info('Financial summary updated: %s', summary._id.toString());
		return res.status(200).json({
			success: true,
			message: 'Financial summary updated successfully',
			data: summary,
		});
	} catch (error) {
		return next(error);
	}
}

async function deleteFinancialSummary(req, res, next) {
	try {
		const { id } = req.params;
		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid financial summary id' });
		}

		const summary = await FinancialSummary.findByIdAndDelete(id);
		if (!summary) {
			return res.status(404).json({ success: false, message: 'Financial summary not found' });
		}

		logger.info('Financial summary deleted: %s', summary._id.toString());
		return res.status(200).json({ success: true, message: 'Financial summary deleted successfully' });
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	getCurrentFinancialSummary,
	createFinancialSummary,
	getFinancialSummaries,
	getFinancialSummaryById,
	updateFinancialSummary,
	deleteFinancialSummary,
};
