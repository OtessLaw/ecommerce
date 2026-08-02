const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_luxury_fashion_2026_production');

      // Hybrid lookup: check Mongoose if DB connected, or set decoded user
      if (User.db && User.db.readyState === 1) {
        req.user = await User.findById(decoded.id).select('-password');
      }
      if (!req.user) {
        req.user = {
          _id: decoded.id,
          name: decoded.name || 'User',
          email: decoded.email || 'user@example.com',
          role: decoded.role || 'customer',
        };
      }
      return next();
    } catch (error) {
      console.error('[Auth Middleware Error]', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user?.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
