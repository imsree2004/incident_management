const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { EmailLog, Ticket } = require('../models');

// Get system metrics
router.get('/metrics', auth, async (req, res) => {
  try {
    const totalEmails = await EmailLog.count();
    const processedToday = await EmailLog.count({
      where: {
        created_at: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    const openTickets = await Ticket.count({ where: { status: 'open' } });
    const autoReplies = await EmailLog.count({ where: { status: 'auto_replied' } });

    res.json({
      totalEmails,
      processedToday,
      openTickets,
      autoReplies
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get email logs with pagination and search
router.get('/email-logs', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = search ? {
      $or: [
        { from_email: { $iLike: `%${search}%` } },
        { subject: { $iLike: `%${search}%` } },
        { category: { $iLike: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await EmailLog.findAndCountAll({
      where: whereCondition,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      logs: rows,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tickets with pagination and filtering
router.get('/tickets', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = status ? { status } : {};

    const { count, rows } = await Ticket.findAndCountAll({
      where: whereCondition,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      tickets: rows,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update ticket status
router.put('/tickets/:ticketId', auth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const ticket = await Ticket.findOne({ where: { ticket_id: ticketId } });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;
    await ticket.save();

    res.json({ message: 'Ticket status updated successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;