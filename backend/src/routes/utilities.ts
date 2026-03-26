const express = require('express');
const { auth, authorize } = require('@/middleware/auth');
const { validate } = require('@/middleware/validation');
const {
	createUtility,
	getUtilities,
	getUtilityById,
	updateUtility,
	deleteUtility,
} = require('@/controllers/utilityController');
const { createUtilitySchema, updateUtilitySchema } = require('@/validators/utilityValidators');

const router = express.Router();

router.get('/', auth, getUtilities);
router.get('/:id', auth, getUtilityById);
router.post('/', auth, authorize('admin', 'manager'), validate(createUtilitySchema), createUtility);
router.put('/:id', auth, authorize('admin', 'manager'), validate(updateUtilitySchema), updateUtility);
router.delete('/:id', auth, authorize('admin'), deleteUtility);

module.exports = router;
