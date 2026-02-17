const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  try {
    // 1️⃣ Check Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authorization token missing or malformed'
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(' ')[1];

    // 3️⃣ Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({
        message: 'Server authentication configuration error'
      });
    }

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Validate admin exists
    const admin = await Admin.findByPk(decoded.id);

    if (!admin) {
      return res.status(401).json({
        message: 'Token is invalid'
      });
    }

    // 6️⃣ Optional role validation
    if (decoded.role && decoded.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // 7️⃣ Attach admin to request
    req.admin = admin;
    req.adminId = admin.id;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      message: 'Token is invalid or expired'
    });
  }
};

module.exports = auth;
