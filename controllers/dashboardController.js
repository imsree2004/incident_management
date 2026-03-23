import { Op } from "sequelize";
import Ticket from "../models/Ticket.js";
import Complaint from "../models/Complaint.js";

export const getAdminDashboardMetrics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalEmails, processedToday, openTickets, autoReplies] = await Promise.all([
      Complaint.count(),
      Complaint.count({ 
        where: { 
          createdAt: { [Op.gte]: today } 
        } 
      }),
      Ticket.count({ where: { status: "OPEN" } }),
      Complaint.count({ where: { autoResponseSent: true } })
    ]);

    res.json({
      success: true,
      message: "Admin metrics fetched successfully",
      data: {
        totalEmails,
        processedToday,
        openTickets,
        autoReplies
      }
    });

  } catch (error) {
    console.error("Error fetching admin metrics:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmailLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Complaint.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]]
    });

    res.json({
      success: true,
      message: "Email logs fetched successfully",
      data: { logs: rows },
      meta: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Ticket.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]]
    });

    res.json({
      success: true,
      message: "Tickets fetched successfully",
      data: { tickets: rows },
      meta: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    ticket.status = status;
    await ticket.save();

    res.json({
      success: true,
      message: "Ticket updated",
      data: { ticket }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
