const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Authorization token missing');
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('_id name email');

    if (!user) {
      res.status(401);
      throw new Error('Invalid token');
    }

    req.user = user;
    next();
  } catch (_error) {
    res.status(401);
    throw new Error('Invalid or expired token');
  }
});

module.exports = authMiddleware;