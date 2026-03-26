const express = require('express');
const { auth, authorize } = require('@/middleware/auth');
const { validate } = require('@/middleware/validation');
const {
	createSalesTransaction,
	getSalesTransactions,
	getSalesTransactionById,
	updateSalesTransaction,
	deleteSalesTransaction,
} = require('@/controllers/salesController');
const { createSalesSchema, updateSalesSchema } = require('@/validators/salesValidators');

const router = express.Router();

router.get('/', auth, getSalesTransactions);
router.get('/:id', auth, getSalesTransactionById);
router.post('/', auth, authorize('admin', 'manager'), validate(createSalesSchema), createSalesTransaction);
router.put('/:id', auth, authorize('admin', 'manager'), validate(updateSalesSchema), updateSalesTransaction);
router.delete('/:id', auth, authorize('admin'), deleteSalesTransaction);

module.exports = router;
