import express from "express";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateStatus,
  updateClassification
} from "../controllers/ticketController.js";

const router = express.Router();

router.post("/", createTicket);
router.get("/", getAllTickets);
router.get("/:id", getTicketById);
router.put("/:id/status", updateStatus);
router.put("/:id/classification", updateClassification);

export default router;
