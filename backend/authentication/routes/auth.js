const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Admin Register
router.post('/register', (req, res, next) => {
  register(req, res, next);
});

// Admin Login
router.post('/login', (req, res, next) => {
  login(req, res, next);
});

module.exports = router;
