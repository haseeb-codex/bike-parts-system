const mongoose = require('mongoose');
const SalesTransaction = require('@/models/SalesTransaction');
const Product = require('@/models/Product');
const Inventory = require('@/models/Inventory');
const InventoryMovement = require('@/models/InventoryMovement');
const logger = require('@/utils/logger');

function isValidObjectId(id) {
	return mongoose.Types.ObjectId.isValid(id);
}

function normalizeCode(value) {
	return value?.toUpperCase().trim();
}

async function applyStockOut(productCode, quantity, reference) {
	const product = await Product.findOne({ code: productCode });
	if (!product) {
		return { error: 'Product not found' };
	}

	if (product.currentStock < quantity) {
		return { error: 'Insufficient product stock for this sale' };
	}

	product.currentStock -= quantity;
	await product.save();

	const inventory = await Inventory.findOne({ productCode });
	if (inventory) {
		if (inventory.quantityAvailable < quantity) {
			product.currentStock += quantity;
			await product.save();
			return { error: 'Insufficient inventory stock for this sale' };
		}

		const previousQuantity = inventory.quantityAvailable;
		inventory.quantityAvailable -= quantity;
		await inventory.save();

		await InventoryMovement.create({
			inventoryId: inventory._id,
			productCode,
			type: 'out',
			quantity,
			previousQuantity,
			newQuantity: inventory.quantityAvailable,
			reason: 'Sale transaction',
			reference,
		});
	}

	return { success: true };
}

async function revertStockOut(productCode, quantity, reference) {
	const product = await Product.findOne({ code: productCode });
	if (product) {
		product.currentStock += quantity;
		await product.save();
	}

	const inventory = await Inventory.findOne({ productCode });
	if (inventory) {
		const previousQuantity = inventory.quantityAvailable;
		inventory.quantityAvailable += quantity;
		await inventory.save();

		await InventoryMovement.create({
			inventoryId: inventory._id,
			productCode,
			type: 'in',
			quantity,
			previousQuantity,
			newQuantity: inventory.quantityAvailable,
			reason: 'Sale transaction rollback',
			reference,
		});
	}
}

async function createSalesTransaction(req, res, next) {
	try {
		const payload = {
			...req.body,
			transactionNumber: normalizeCode(req.body.transactionNumber),
			productCode: normalizeCode(req.body.productCode),
			totalAmount: Number(req.body.totalAmount ?? req.body.quantity * req.body.unitPrice),
		};

		const existing = await SalesTransaction.findOne({ transactionNumber: payload.transactionNumber });
		if (existing) {
			return res.status(409).json({ success: false, message: 'Transaction number already exists' });
		}

		const stockResult = await applyStockOut(payload.productCode, payload.quantity, payload.transactionNumber);
		if (stockResult.error) {
			return res.status(400).json({ success: false, message: stockResult.error });
		}

		const transaction = await SalesTransaction.create(payload);
		logger.info('Sales transaction created: %s', transaction.transactionNumber);

		return res.status(201).json({
			success: true,
			message: 'Sales transaction created successfully',
			data: transaction,
		});
	} catch (error) {
		return next(error);
	}
}

async function getSalesTransactions(req, res, next) {
	try {
		const {
			productCode,
			paymentMethod,
			status,
			fromDate,
			toDate,
			search,
			page = 1,
			limit = 20,
			sortBy = 'saleDate',
			order = 'desc',
		} = req.query;

		const query: any = {};
		if (productCode) query.productCode = normalizeCode(productCode);
		if (paymentMethod) query.paymentMethod = paymentMethod;
		if (status) query.status = status;

		if (fromDate || toDate) {
			query.saleDate = {};
			if (fromDate) query.saleDate.$gte = new Date(String(fromDate));
			if (toDate) query.saleDate.$lte = new Date(String(toDate));
		}

		if (search) {
			query.$or = [
				{ transactionNumber: { $regex: search, $options: 'i' } },
				{ customerName: { $regex: search, $options: 'i' } },
				{ productCode: { $regex: search, $options: 'i' } },
			];
		}

		const pageNumber = Math.max(Number(page) || 1, 1);
		const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
		const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
		const sort = { [sortBy]: sortOrder };

		const [items, total] = await Promise.all([
			SalesTransaction.find(query).sort(sort).skip((pageNumber - 1) * pageSize).limit(pageSize),
			SalesTransaction.countDocuments(query),
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

async function getSalesTransactionById(req, res, next) {
	try {
		const { id } = req.params;
		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid sales transaction id' });
		}

		const transaction = await SalesTransaction.findById(id);
		if (!transaction) {
			return res.status(404).json({ success: false, message: 'Sales transaction not found' });
		}

		return res.status(200).json({ success: true, data: transaction });
	} catch (error) {
		return next(error);
	}
}

async function updateSalesTransaction(req, res, next) {
	try {
		const { id } = req.params;
		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid sales transaction id' });
		}

		const transaction = await SalesTransaction.findByIdAndUpdate(id, req.body, {
			returnDocument: 'after',
			runValidators: true,
		});

		if (!transaction) {
			return res.status(404).json({ success: false, message: 'Sales transaction not found' });
		}

		logger.info('Sales transaction updated: %s', transaction.transactionNumber);
		return res.status(200).json({
			success: true,
			message: 'Sales transaction updated successfully',
			data: transaction,
		});
	} catch (error) {
		return next(error);
	}
}

async function deleteSalesTransaction(req, res, next) {
	try {
		const { id } = req.params;
		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid sales transaction id' });
		}

		const transaction = await SalesTransaction.findByIdAndDelete(id);
		if (!transaction) {
			return res.status(404).json({ success: false, message: 'Sales transaction not found' });
		}

		await revertStockOut(transaction.productCode, transaction.quantity, transaction.transactionNumber);

		logger.info('Sales transaction deleted: %s', transaction.transactionNumber);
		return res.status(200).json({ success: true, message: 'Sales transaction deleted successfully' });
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	createSalesTransaction,
	getSalesTransactions,
	getSalesTransactionById,
	updateSalesTransaction,
	deleteSalesTransaction,
};
