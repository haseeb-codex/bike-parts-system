const mongoose = require('mongoose');
const Inventory = require('@/models/Inventory');
const InventoryMovement = require('@/models/InventoryMovement');
const Product = require('@/models/Product');
const logger = require('@/utils/logger');

function isValidObjectId(id) {
	return mongoose.Types.ObjectId.isValid(id);
}

function normalizeCode(value) {
	return value?.toUpperCase().trim();
}

async function syncProductStock(productCode, newQuantity) {
	await Product.updateOne({ code: productCode }, { $set: { currentStock: newQuantity } });
}

async function createInventory(req, res, next) {
	try {
		const payload = {
			...req.body,
			productCode: normalizeCode(req.body.productCode),
		};

		const existing = await Inventory.findOne({ productCode: payload.productCode });
		if (existing) {
			return res.status(409).json({ success: false, message: 'Inventory for this product already exists' });
		}

		const inventory = await Inventory.create(payload);

		await Promise.all([
			InventoryMovement.create({
				inventoryId: inventory._id,
				productCode: inventory.productCode,
				type: 'adjustment',
				quantity: inventory.quantityAvailable,
				previousQuantity: 0,
				newQuantity: inventory.quantityAvailable,
				reason: 'Initial inventory record created',
				reference: 'INITIAL',
			}),
			syncProductStock(inventory.productCode, inventory.quantityAvailable),
		]);

		logger.info('Inventory created for product: %s', inventory.productCode);
		return res.status(201).json({
			success: true,
			message: 'Inventory created successfully',
			data: inventory,
		});
	} catch (error) {
		return next(error);
	}
}

async function getInventories(req, res, next) {
	try {
		const {
			lowStock,
			search,
			location,
			page = 1,
			limit = 20,
			sortBy = 'updatedAt',
			order = 'desc',
		} = req.query;

		const query: any = {};

		if (location) query.location = location;
		if (search) {
			query.$or = [
				{ productName: { $regex: search, $options: 'i' } },
				{ productCode: { $regex: search, $options: 'i' } },
			];
		}

		if (String(lowStock).toLowerCase() === 'true') {
			query.$expr = { $lte: ['$quantityAvailable', '$reorderLevel'] };
		}

		const pageNumber = Math.max(Number(page) || 1, 1);
		const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
		const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
		const sort = { [sortBy]: sortOrder };

		const [items, total] = await Promise.all([
			Inventory.find(query).sort(sort).skip((pageNumber - 1) * pageSize).limit(pageSize),
			Inventory.countDocuments(query),
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

async function getInventoryById(req, res, next) {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid inventory id' });
		}

		const inventory = await Inventory.findById(id);
		if (!inventory) {
			return res.status(404).json({ success: false, message: 'Inventory not found' });
		}

		return res.status(200).json({ success: true, data: inventory });
	} catch (error) {
		return next(error);
	}
}

async function updateInventory(req, res, next) {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid inventory id' });
		}

		const inventory = await Inventory.findByIdAndUpdate(id, req.body, {
			returnDocument: 'after',
			runValidators: true,
		});

		if (!inventory) {
			return res.status(404).json({ success: false, message: 'Inventory not found' });
		}

		logger.info('Inventory metadata updated for product: %s', inventory.productCode);
		return res.status(200).json({
			success: true,
			message: 'Inventory updated successfully',
			data: inventory,
		});
	} catch (error) {
		return next(error);
	}
}

async function adjustInventory(req, res, next) {
	try {
		const { id } = req.params;
		const { type, quantity, reason, reference } = req.body;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid inventory id' });
		}

		const inventory = await Inventory.findById(id);
		if (!inventory) {
			return res.status(404).json({ success: false, message: 'Inventory not found' });
		}

		const previousQuantity = inventory.quantityAvailable;
		let newQuantity = previousQuantity;

		if (type === 'in') {
			newQuantity += quantity;
		} else if (type === 'out') {
			newQuantity -= quantity;
		} else {
			newQuantity = quantity;
		}

		if (newQuantity < 0) {
			return res.status(400).json({ success: false, message: 'Insufficient stock for this operation' });
		}

		inventory.quantityAvailable = newQuantity;
		await inventory.save();

		await Promise.all([
			InventoryMovement.create({
				inventoryId: inventory._id,
				productCode: inventory.productCode,
				type,
				quantity,
				previousQuantity,
				newQuantity,
				reason,
				reference,
			}),
			syncProductStock(inventory.productCode, newQuantity),
		]);

		logger.info('Inventory adjusted for %s: %d -> %d', inventory.productCode, previousQuantity, newQuantity);
		return res.status(200).json({
			success: true,
			message: 'Inventory adjusted successfully',
			data: inventory,
		});
	} catch (error) {
		return next(error);
	}
}

async function getInventoryMovements(req, res, next) {
	try {
		const { id } = req.params;
		const { type, page = 1, limit = 20 } = req.query;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid inventory id' });
		}

		const inventory = await Inventory.findById(id);
		if (!inventory) {
			return res.status(404).json({ success: false, message: 'Inventory not found' });
		}

		const query: any = { inventoryId: id };
		if (type) query.type = type;

		const pageNumber = Math.max(Number(page) || 1, 1);
		const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);

		const [items, total] = await Promise.all([
			InventoryMovement.find(query)
				.sort({ createdAt: -1 })
				.skip((pageNumber - 1) * pageSize)
				.limit(pageSize),
			InventoryMovement.countDocuments(query),
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

async function deleteInventory(req, res, next) {
	try {
		const { id } = req.params;

		if (!isValidObjectId(id)) {
			return res.status(400).json({ success: false, message: 'Invalid inventory id' });
		}

		const inventory = await Inventory.findByIdAndDelete(id);
		if (!inventory) {
			return res.status(404).json({ success: false, message: 'Inventory not found' });
		}

		await Promise.all([
			InventoryMovement.deleteMany({ inventoryId: id }),
			syncProductStock(inventory.productCode, 0),
		]);

		logger.info('Inventory deleted for product: %s', inventory.productCode);
		return res.status(200).json({ success: true, message: 'Inventory deleted successfully' });
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	createInventory,
	getInventories,
	getInventoryById,
	updateInventory,
	adjustInventory,
	getInventoryMovements,
	deleteInventory,
};
