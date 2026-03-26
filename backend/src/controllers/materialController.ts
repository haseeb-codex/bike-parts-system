const mongoose = require('mongoose');
const Material = require('@/models/Material');
const logger = require('@/utils/logger');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function createMaterial(req, res, next) {
  try {
    const payload = {
      ...req.body,
      code: req.body.code?.toUpperCase().trim(),
    };

    const existing = await Material.findOne({ code: payload.code });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Material code already exists' });
    }

    const material = await Material.create(payload);
    logger.info('Material created: %s', material.code);

    return res.status(201).json({
      success: true,
      message: 'Material created successfully',
      data: material,
    });
  } catch (error) {
    return next(error);
  }
}

async function getMaterials(req, res, next) {
  try {
    const {
      type,
      search,
      lowStock,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query: any = {};

    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
      ];
    }

    if (String(lowStock).toLowerCase() === 'true') {
      query.$expr = { $lte: ['$quantityInStock', '$reorderLevel'] };
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const sortOrder = String(order).toLowerCase() === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const [items, total] = await Promise.all([
      Material.find(query).sort(sort).skip((pageNumber - 1) * pageSize).limit(pageSize),
      Material.countDocuments(query),
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

async function getMaterialById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid material id' });
    }

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    return res.status(200).json({ success: true, data: material });
  } catch (error) {
    return next(error);
  }
}

async function updateMaterial(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid material id' });
    }

    const updates = { ...req.body };
    if (updates.code) {
      updates.code = updates.code.toUpperCase().trim();
      const duplicate = await Material.findOne({ code: updates.code, _id: { $ne: id } });
      if (duplicate) {
        return res.status(409).json({ success: false, message: 'Material code already exists' });
      }
    }

    const material = await Material.findByIdAndUpdate(id, updates, { returnDocument: 'after', runValidators: true });

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    logger.info('Material updated: %s', material.code);
    return res.status(200).json({ success: true, message: 'Material updated successfully', data: material });
  } catch (error) {
    return next(error);
  }
}

async function deleteMaterial(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid material id' });
    }

    const material = await Material.findByIdAndDelete(id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    logger.info('Material deleted: %s', material.code);
    return res.status(200).json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
};
