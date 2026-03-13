import express from 'express';
import {
  getTickets,
  getDashboardMetrics,
  getTicketById,
  updateStatus,
  sendReply
} from '../controllers/ticket.controller.js';

import { authMiddleware, supportOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

/* PROTECTED ROUTES */

router.get('/', authMiddleware, supportOnly, getTickets);

router.get('/metrics', authMiddleware, supportOnly, getDashboardMetrics);

router.get('/:id', authMiddleware, supportOnly, getTicketById);

router.patch('/:id/status', authMiddleware, supportOnly, updateStatus);

router.post('/:id/reply', authMiddleware, supportOnly, sendReply);


export default router;