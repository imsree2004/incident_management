import express from 'express';
import { login, register } from '../controllers/support.controller.js';

const router = express.Router();

// registration
router.post('/register', register);

// login
router.post('/login', login);

export default router;
