const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// --------------------
// Helpers
// --------------------
const generateToken = (admin) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
    { id: admin.id, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

const serializeAuthAdmin = (admin, token) => ({
  id: admin.id,
  username: admin.username,
  email: admin.email,
  token
});

// --------------------
// REGISTER
// --------------------
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const emailExists = await Admin.findOne({ where: { email } });
    if (emailExists) {
      return sendError(res, {
        status: 409,
        message: 'Email already registered'
      });
    }

    const usernameExists = await Admin.findOne({ where: { username } });
    if (usernameExists) {
      return sendError(res, {
        status: 409,
        message: 'Username already taken'
      });
    }

    const admin = await Admin.create({
      username,
      email,
      password
    });

    const token = generateToken(admin);

    return sendSuccess(res, {
      status: 201,
      message: 'Admin account created successfully',
      data: serializeAuthAdmin(admin, token)
    });

  } catch (error) {
    console.error('Register error:', error);
    return sendError(res, {
      status: 500,
      message: 'Registration failed'
    });
  }
};

// --------------------
// LOGIN
// --------------------
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({
      where: { username },
      attributes: ['id', 'username', 'email', 'password']
    });

    if (!admin) {
      return sendError(res, {
        status: 401,
        message: 'Invalid username or password'
      });
    }

    const isMatch = await admin.validatePassword(password);

    if (!isMatch) {
      return sendError(res, {
        status: 401,
        message: 'Invalid username or password'
      });
    }

    const token = generateToken(admin);

    return sendSuccess(res, {
      message: 'Admin authenticated successfully',
      data: serializeAuthAdmin(admin, token)
    });

  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, {
      status: 500,
      message: 'Login failed'
    });
  }
};