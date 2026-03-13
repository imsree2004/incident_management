const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { sendError } = require('../utils/apiResponse');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, {
        status: 401,
        message: 'Authorization token missing or malformed'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return sendError(res, {
        status: 500,
        message: 'Server authentication configuration error'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findByPk(decoded.id);

    if (!admin) {
      return sendError(res, {
        status: 401,
        message: 'Token is invalid'
      });
    }

    if (decoded.role && decoded.role !== 'admin') {
      return sendError(res, {
        status: 403,
        message: 'Access denied'
      });
    }

    req.admin = admin;
    req.adminId = admin.id;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return sendError(res, {
      status: 401,
      message: 'Token is invalid or expired'
    });
  }
};

module.exports = { verifyToken };