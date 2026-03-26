const express = require('express');
const { auth, authorize } = require('@/middleware/auth');
const { validate } = require('@/middleware/validation');
const {
	createProductionRecord,
	getProductionRecords,
	getProductionRecordById,
	updateProductionRecord,
	deleteProductionRecord,
} = require('@/controllers/productionController');
const { createProductionSchema, updateProductionSchema } = require('@/validators/productionValidators');

const router = express.Router();

router.get('/', auth, getProductionRecords);
router.get('/:id', auth, getProductionRecordById);
router.post('/', auth, authorize('admin', 'manager'), validate(createProductionSchema), createProductionRecord);
router.put('/:id', auth, authorize('admin', 'manager'), validate(updateProductionSchema), updateProductionRecord);
router.delete('/:id', auth, authorize('admin'), deleteProductionRecord);

module.exports = router;
