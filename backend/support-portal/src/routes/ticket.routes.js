import express from 'express';
import {
  getTickets,
  getTicketById,
  updateStatus,
  sendReply,
  createTicket
} from '../controllers/ticket.controller.js';


const router = express.Router();

// ✅ THIS PATH MUST BE /tickets
router.post('/', createTicket);
router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicketById);
router.patch('/tickets/:id/status', updateStatus);
router.post('/tickets/:id/reply', sendReply);


export default router;
