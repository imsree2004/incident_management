const { Ticket } = require("../models");

exports.createTicket = async (req, res) => {
  try {
    const { email_id, subject, raw_email, summary } = req.body;

    const ticket = await Ticket.create({
      email_id,
      subject,
      raw_email,
      summary
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

exports.getAllTickets = async (req, res) => {
  const tickets = await Ticket.findAll();
  res.json(tickets);
};

exports.getTicketById = async (req, res) => {
  const ticket = await Ticket.findByPk(req.params.id);
  res.json(ticket);
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;

  await Ticket.update(
    { status },
    { where: { id: req.params.id } }
  );

  res.json({ message: "Ticket status updated" });
};

exports.updateClassification = async (req, res) => {
  const { severity, department, confidence } = req.body;

  await Ticket.update(
    { severity, department, confidence },
    { where: { id: req.params.id } }
  );

  res.json({ message: "Ticket classification updated" });
};

