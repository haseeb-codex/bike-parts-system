const jwt = require('jsonwebtoken');
const { config } = require('@/config/environment');
const User = require('@/models/User');

function normalizeAuthRole(role) {
  return role === 'admin' ? 'super_admin' : role;
}

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.sub).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid token user' });
    }

    user.role = normalizeAuthRole(user.role);

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const effectiveRole = normalizeAuthRole(req.user.role);

    if (!roles.includes(effectiveRole)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return next();
  };
}

module.exports = { auth, authorize };
