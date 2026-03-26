const express = require('express');
const { auth, authorize } = require('@/middleware/auth');
const { validate } = require('@/middleware/validation');
const {
	createInventory,
	getInventories,
	getInventoryById,
	updateInventory,
	adjustInventory,
	getInventoryMovements,
	deleteInventory,
} = require('@/controllers/inventoryController');
const {
	createInventorySchema,
	updateInventorySchema,
	adjustInventorySchema,
} = require('@/validators/inventoryValidators');

const router = express.Router();

router.get('/', auth, getInventories);
router.get('/:id', auth, getInventoryById);
router.get('/:id/movements', auth, getInventoryMovements);

router.post('/', auth, authorize('admin', 'manager'), validate(createInventorySchema), createInventory);
router.put('/:id', auth, authorize('admin', 'manager'), validate(updateInventorySchema), updateInventory);
router.patch('/:id/adjust', auth, authorize('admin', 'manager'), validate(adjustInventorySchema), adjustInventory);
router.delete('/:id', auth, authorize('admin'), deleteInventory);

module.exports = router;
