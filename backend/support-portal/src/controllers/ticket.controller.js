import Ticket from '../models/Ticket.js';
export const createTicket = async (req, res) => {
  try {
    const ticket = await Ticket.create(req.body);

    res.status(201).json({
      message: 'Ticket created successfully',
      ticketId: ticket.id
    });
  } catch (error) {
    console.error('CREATE TICKET ERROR:', error);
    res.status(500).json({ message: 'Failed to create ticket' });
  }
};


/* GET ALL TICKETS (LIST VIEW) */
export const getTickets = async (req, res) => {
  const tickets = await Ticket.findAll({
    attributes: ['id', 'summary', 'severity', 'status']
  });
  res.json(tickets);
};

/* GET SINGLE TICKET (DETAIL VIEW) */
export const getTicketById = async (req, res) => {
  const ticket = await Ticket.findByPk(req.params.id);

  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  res.json({
    aiSummary: {
      category: ticket.category,
      severity: ticket.severity,
      confidence: ticket.confidence,
      description: ticket.summary
    },
    aiInsights: ticket.aiInsights,
    originalEmail: ticket.originalEmail
  });
};

/* UPDATE STATUS */
export const updateStatus = async (req, res) => {
  const ticket = await Ticket.findByPk(req.params.id);
  ticket.status = req.body.status;
  await ticket.save();

  res.json({ message: 'Status updated' });
};

/* SEND REPLY */
export const sendReply = async (req, res) => {
  const ticket = await Ticket.findByPk(req.params.id);
  ticket.draftReply = req.body.replyText;
  await ticket.save();

  res.json({ message: 'Reply sent' });
};
