const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --------------------
// REGISTER
// --------------------
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    // Email validation
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Password strength
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    // Duplicate email
    const emailExists = await Admin.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({
        message: 'Email already registered'
      });
    }

    // Duplicate username
    const usernameExists = await Admin.findOne({ where: { username } });
    if (usernameExists) {
      return res.status(400).json({
        message: 'Username already taken'
      });
    }

    // ✅ DO NOT hash here (model hook will do it)
    const admin = await Admin.create({
      username,
      email,
      password
    });

    return res.status(201).json({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      token: generateToken(admin)
    });

  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({
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

    // Fast input validation
    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required'
      });
    }

    // Find admin
    const admin = await Admin.findOne({
      where: { username },
      attributes: ['id', 'username', 'email', 'password']
    });

    // Fast fail
    if (!admin) {
      return res.status(401).json({
        message: 'Invalid username or password'
      });
    }

    // Validate password
    const isMatch = await admin.validatePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid username or password'
      });
    }

    // Success
    return res.json({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      token: generateToken(admin)
    });

  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      message: 'Login failed'
    });
  }
};
