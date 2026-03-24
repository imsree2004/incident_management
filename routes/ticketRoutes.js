import express from "express";
import {
  createTicket,
  intakeComplaintAsTicket,
  getMyTickets,
  getTicketById,
  updateStatus,
  updateClassification,
  getSupportDashboardMetrics,
  sendReply
} from "../controllers/ticketController.js";

import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔥 protected routes
router.use(auth);

router.get("/",auth,getMyTickets);
router.get("/metrics", getSupportDashboardMetrics); // <-- Ensure this is before /:id
router.get("/:id", getTicketById);

router.post("/", createTicket);
router.post("/intake/:complaintId", intakeComplaintAsTicket);

router.patch("/:id/status",auth,updateStatus);
router.put("/:id/classify", updateClassification);
router.post("/:id/reply", sendReply);

export default router;