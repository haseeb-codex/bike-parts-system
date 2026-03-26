const mongoose = require('mongoose');
const PurchaseOrder = require('@/models/PurchaseOrder');
const Material = require('@/models/Material');
const logger = require('@/utils/logger');

function isValidObjectId(id) {
	return mongoose.Types.ObjectId.isValid(id);
}

function normalizeCode(value) {
	return value?.toUpperCase().trim();
}

async function applyMaterialStockIn(materialCode, quantity) {
	const material = await Material.findOne({ code: materialCode });
	if (!material) {
		return { error: 'Material not found' };
	}

	material.quantityInStock += quantity;
	await material.save();
	return { success: true };
}

async function revertMaterialStockIn(materialCode, quantity) {
	const material = await Material.findOne({ code: materialCode });
	if (!material) {
		return { error: 'Material not found' };
	}

	if (material.quantityInStock < quantity) {
		return { error: 'Cannot rollback purchase due to insufficient current stock' };
	}

	material.quantityInStock -= quantity;
	await material.save();
	return { success: true };
}

async function createPurchaseOrder(req, res, next) {
	try {
		const payload = {
			...req.body,
			purchaseNumber: normalizeCode(req.body.purchaseNumber),
			materialCode: normalizeCode(req.body.materialCode),
			totalAmount: Number(req.body.totalAmount ?? req.body.quantity * req.body.unitCost),
		};

		const existing = await PurchaseOrder.findOne({ purchaseNumber: payload.purchaseNumber });
		if (existing) {
			return res.status(409).json({ success: false, message: 'Purchase number already exists' });
		}

		const stockResult = await applyMaterialStockIn(payload.materialCode, payload.quantity);
		if (stockResult.error) {
			return res.status(400).json({ success: false, message: stockResult.error });
		}

		const purchase = await PurchaseOrder.create(payload);
		logger.info('Purchase created: %s', purchase.purchaseNumber);

		return res.status(201).json({
			success: true,
			message: 'Purchase order created successfully',
			data: purchase,
		});
	} catch (error) {
		return next(error);
	}
}

async function getPurchaseOrders(req, res, next) {
	try {
		const {
			materialCode,
			status,
			fromDate,
			toDate,
			search,
			page = 1,
			limit = 20,
			sortBy = 'purchaseDate',
			order = 'desc',
		} = req.query;

		const query: any = {};
		if (materialCode) query.materialCode = normalizeCode(materialCode);
		if (status) query.status = status;

		if (fromDate || toDate) {
			query.purchaseDate = {};
			if (fromDate) query.purchaseDate.$gte = new Date(String(fromDate));
			if (toDate) query.purchaseDate.$lte = new Date(String(toDate));
		}

		if (search) {
			query.$or = [
				{ purchaseNumber: { $regex: search, $options: 'i' } },
				{ supplierName: { $regex: search, $options: 'i' } },
				{ materialCode: { $regex: search, $options: 'i' } },
			];
		}

		const pageNumber = Math.max(Number(page) || 1, 1);
		const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
		const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
		const sort = { [sortBy]: sortOrder };

		const [items, total] = await Promise.all([
			PurchaseOrder.find(query).sort(sort).skip((pageNumber - 1) * pageSize).limit(pageSize),
			PurchaseOrder.countDocuments(query),
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

async function getPurchaseOrderById(req, res, next) {
	try {
		const { id } = req.params;
		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid purchase id' });
		}

		const purchase = await PurchaseOrder.findById(id);
		if (!purchase) {
			return res.status(404).json({ success: false, message: 'Purchase order not found' });
		}

		return res.status(200).json({ success: true, data: purchase });
	} catch (error) {
		return next(error);
	}
}

async function updatePurchaseOrder(req, res, next) {
	try {
		const { id } = req.params;
		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid purchase id' });
		}

		const purchase = await PurchaseOrder.findByIdAndUpdate(id, req.body, {
			returnDocument: 'after',
			runValidators: true,
		});

		if (!purchase) {
			return res.status(404).json({ success: false, message: 'Purchase order not found' });
		}

		logger.info('Purchase updated: %s', purchase.purchaseNumber);
		return res.status(200).json({
			success: true,
			message: 'Purchase order updated successfully',
			data: purchase,
		});
	} catch (error) {
		return next(error);
	}
}

async function deletePurchaseOrder(req, res, next) {
	try {
		const { id } = req.params;
		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid purchase id' });
		}

		const purchase = await PurchaseOrder.findById(id);
		if (!purchase) {
			return res.status(404).json({ success: false, message: 'Purchase order not found' });
		}

		const rollback = await revertMaterialStockIn(purchase.materialCode, purchase.quantity);
		if (rollback.error) {
			return res.status(400).json({ success: false, message: rollback.error });
		}

		await PurchaseOrder.findByIdAndDelete(id);

		logger.info('Purchase deleted: %s', purchase.purchaseNumber);
		return res.status(200).json({ success: true, message: 'Purchase order deleted successfully' });
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	createPurchaseOrder,
	getPurchaseOrders,
	getPurchaseOrderById,
	updatePurchaseOrder,
	deletePurchaseOrder,
};
