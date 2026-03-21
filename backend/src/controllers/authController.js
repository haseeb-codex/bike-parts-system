const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { config } = require('../config/environment');
const logger = require('../utils/logger');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'manager', 'operator').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
}

async function register(req, res, next) {
  try {
    const { value, error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const existing = await User.findOne({ email: value.email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name: value.name,
      email: value.email.toLowerCase(),
      password: value.password,
      role: value.role || 'operator',
    });

    const token = signToken(user);
    logger.info('User registered', { email: user.email, role: user.role });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token },
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const user = await User.findOne({ email: value.email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await user.comparePassword(value.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    logger.info('User login success', { email: user.email });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
        },
        token,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res) {
  return res.status(200).json({ success: true, data: { user: req.user } });
}

module.exports = { register, login, me };
