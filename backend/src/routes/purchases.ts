const express = require('express');
const { auth, authorize } = require('@/middleware/auth');
const { validate } = require('@/middleware/validation');
const {
	createPurchaseOrder,
	getPurchaseOrders,
	getPurchaseOrderById,
	updatePurchaseOrder,
	deletePurchaseOrder,
} = require('@/controllers/purchaseController');
const { createPurchaseSchema, updatePurchaseSchema } = require('@/validators/purchaseValidators');

const router = express.Router();

router.get('/', auth, getPurchaseOrders);
router.get('/:id', auth, getPurchaseOrderById);
router.post('/', auth, authorize('admin', 'manager'), validate(createPurchaseSchema), createPurchaseOrder);
router.put('/:id', auth, authorize('admin', 'manager'), validate(updatePurchaseSchema), updatePurchaseOrder);
router.delete('/:id', auth, authorize('admin'), deletePurchaseOrder);

module.exports = router;
