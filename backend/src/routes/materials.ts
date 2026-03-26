const express = require('express');
const { auth, authorize } = require('@/middleware/auth');
const { validate } = require('@/middleware/validation');
const {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
} = require('@/controllers/materialController');
const { createMaterialSchema, updateMaterialSchema } = require('@/validators/materialValidators');

const router = express.Router();

router.get('/', auth, getMaterials);
router.get('/:id', auth, getMaterialById);
router.post('/', auth, authorize('admin', 'manager'), validate(createMaterialSchema), createMaterial);
router.put('/:id', auth, authorize('admin', 'manager'), validate(updateMaterialSchema), updateMaterial);
router.delete('/:id', auth, authorize('admin'), deleteMaterial);

module.exports = router;
