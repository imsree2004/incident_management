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
