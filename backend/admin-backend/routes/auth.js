const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { validateRegisterBody, validateLoginBody } = require('../validators/adminSchemas');

router.post('/register', validate('body', validateRegisterBody), register);

router.post('/login', validate('body', validateLoginBody), login);

module.exports = router;
