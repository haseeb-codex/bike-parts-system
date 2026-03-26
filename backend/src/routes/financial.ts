const express = require('express');
const { auth, authorize } = require('@/middleware/auth');
const { validate } = require('@/middleware/validation');
const {
	getCurrentFinancialSummary,
	createFinancialSummary,
	getFinancialSummaries,
	getFinancialSummaryById,
	updateFinancialSummary,
	deleteFinancialSummary,
} = require('@/controllers/financialController');
const {
	createFinancialSummarySchema,
	updateFinancialSummarySchema,
} = require('@/validators/financialValidators');

const router = express.Router();

router.get('/summary', auth, getCurrentFinancialSummary);
router.get('/', auth, getFinancialSummaries);
router.get('/:id', auth, getFinancialSummaryById);
router.post('/', auth, authorize('admin', 'manager'), validate(createFinancialSummarySchema), createFinancialSummary);
router.put('/:id', auth, authorize('admin', 'manager'), validate(updateFinancialSummarySchema), updateFinancialSummary);
router.delete('/:id', auth, authorize('admin'), deleteFinancialSummary);

module.exports = router;
