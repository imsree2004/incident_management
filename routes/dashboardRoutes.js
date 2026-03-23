import express from "express";
import { 
  getAdminDashboardMetrics, 
  getEmailLogs, 
  getTickets, 
  updateTicketStatus 
} from "../controllers/dashboardController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect routes
router.use(auth);

router.get("/metrics", getAdminDashboardMetrics);
router.get("/email-logs", getEmailLogs);
router.get("/tickets", getTickets);
router.put("/tickets/:ticketId", updateTicketStatus);

export default router;
