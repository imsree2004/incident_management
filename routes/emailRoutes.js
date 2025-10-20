import express from 'express';
import { fetchEmails } from '../controllers/emailController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected route — only logged-in admin can fetch emails
router.get('/fetch', verifyToken, fetchEmails);

export default router;
