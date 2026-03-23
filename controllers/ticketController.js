import Ticket from "../models/Ticket.js";
import Complaint from "../models/Complaint.js";
import { generateTicketNumber } from "../utils/ticketNumberGenerator.js";
import { extractTicketNumber } from "../utils/ticketMatcher.js";
import User from "../models/User.js";

/**
 * OLD: Manual ticket creation (admin/testing)
 */
export const createTicket = async (req, res) => {
  try {
    const { email_id, subject, raw_email, summary } = req.body;

    // 🔹 get next ticket id
    const lastTicket = await Ticket.findOne({
      order: [["id", "DESC"]]
    });
    const nextId = lastTicket ? lastTicket.id + 1 : 1;
    const ticketNumber = generateTicketNumber(nextId);

    const ticket = await Ticket.create({
      ticket_number: ticketNumber,
      email_id,
      subject,
      raw_email,
      summary,
      status: "OPEN"
    });

    res.status(201).json({
      message: "Ticket created successfully",
      ticket
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating ticket",
      error: error.message
    });
  }
};

/**
 * ✅ MAIN FLOW: Ticket Intake from Complaint
 */
export const intakeComplaintAsTicket = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findByPk(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    /**
     * 🔁 FOLLOW-UP DETECTION
     */
    const extractedTicketNo = extractTicketNumber(complaint.subject);
    if (extractedTicketNo) {
      const existingTicket = await Ticket.findOne({
        where: { ticket_number: extractedTicketNo }
      });

      if (existingTicket) {
        return res.json({
          message: "Follow-up email attached to existing ticket",
          ticket: existingTicket
        });
      }
    }

    // Only MEDIUM / HIGH create tickets
    if (!["HIGH", "MEDIUM"].includes(complaint.severity)) {
      return res.status(400).json({
        message: "Complaint not eligible for ticket creation",
        severity: complaint.severity
      });
    }

    /**
     * 🆕 CREATE NEW TICKET
     */
    const summary =
      complaint.processed_meta?.nlp?.cleaned_text?.slice(0, 200) ||
      complaint.subject;

    // 🔹 get next ticket id
    const lastTicket = await Ticket.findOne({
      order: [["id", "DESC"]]
    });
    const nextId = lastTicket ? lastTicket.id + 1 : 1;
    const ticketNumber = generateTicketNumber(nextId);

    const ticket = await Ticket.create({
      ticket_number: ticketNumber,
      email_id: complaint.id,
      subject: complaint.subject,
      summary,
      severity: complaint.severity,
      status: "OPEN"
    });

    res.status(201).json({
      message: "New ticket created",
      ticket
    });
  } catch (error) {
    console.error("Ticket intake error:", error);
    res.status(500).json({
      message: "Ticket intake failed",
      error: error.message
    });
  }
};

/**
 * View all tickets
 */
export const getAllTickets = async (req, res) => {
  let where = {};

  // 🔥 AGENT → only assigned tickets
  if (req.user.role === "agent") {
    where.assigned_to = req.user.id;
  }

  const tickets = await Ticket.findAll({ where });

  res.json(tickets);
};

/**
 * View ticket by ID
 */
export const getTicketById = async (req, res) => {
  const ticket = await Ticket.findByPk(req.params.id);
  res.json(ticket);
};

/**
 * Update ticket status
 */
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;

    const ticket = await Ticket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // ✅ ONLY decrease load if resolving
    if (status === "RESOLVED" && ticket.assigned_to) {
      const agent = await User.findByPk(ticket.assigned_to);

      if (agent && agent.current_load > 0) {
        agent.current_load -= 1;
        await agent.save();
      }
    }

    ticket.status = status;
    await ticket.save();

    res.json({ message: "Ticket status updated", ticket });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating status" });
  }
};

/**
 * Update ticket classification
 */
export const updateClassification = async (req, res) => {
  const { severity, department, confidence } = req.body;

  await Ticket.update(
    { severity, department, confidence },
    { where: { id: req.params.id } }
  );

  res.json({ message: "Ticket classification updated" });
};
/**
 * 🔥 GET TICKETS FOR LOGGED-IN USER
 */
export const getMyTickets = async (req, res) => {
  try {
    const user = req.user;

    let tickets;

    if (user.role === "admin") {
    // admin sees all
      tickets = await Ticket.findAll();
    } else {
      // agent sees only assigned
      tickets = await Ticket.findAll({
        where: { assigned_to: user.id }
      });
    }

    res.json(tickets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🔥 SUPPORT DASHBOARD METRICS
 */
import { Op } from "sequelize";

export const getSupportDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [assigned, open, resolved, resolvedTodayCount, pending] = await Promise.all([
      Ticket.count({ where: { assigned_to: userId } }),
      Ticket.count({ where: { assigned_to: userId, status: "OPEN" } }),
      Ticket.count({ where: { assigned_to: userId, status: "RESOLVED" } }),
      Ticket.count({ 
        where: { 
          assigned_to: userId, 
          status: "RESOLVED",
          updatedAt: { [Op.gte]: today }
        } 
      }),
      Ticket.count({ where: { assigned_to: userId, status: "PENDING" } })
    ]);

    res.json({
      success: true,
      message: "Metrics fetched successfully",
      data: {
        assignedTickets: assigned,
        openTickets: open,
        resolvedTickets: resolved,
        resolvedToday: resolvedTodayCount,
        pendingTickets: pending
      }
    });

  } catch (error) {
    console.error("Error fetching support metrics:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};