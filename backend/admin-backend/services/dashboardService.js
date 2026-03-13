const { Op } = require('sequelize');

const { EmailLog, Ticket, AdminAuditLog } = require('../models');
const { createHttpError } = require('../utils/httpError');
const { buildPaginationMeta } = require('../validators/adminSchemas');

const getStartOfToday = () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return startOfToday;
};

const getMetrics = async () => {
  const startOfToday = getStartOfToday();

  const [totalEmails, processedToday, openTickets, autoReplies] = await Promise.all([
    EmailLog.count(),
    EmailLog.count({
      where: {
        createdAt: {
          [Op.gte]: startOfToday
        }
      }
    }),
    Ticket.count({
      where: { status: 'open' }
    }),
    EmailLog.count({
      where: { status: 'auto_replied' }
    })
  ]);

  return {
    totalEmails,
    processedToday,
    openTickets,
    autoReplies
  };
};

const getEmailLogs = async ({ page, limit, search }) => {
  const offset = (page - 1) * limit;

  const where = search ? {
    [Op.or]: [
      { from_email: { [Op.iLike]: `%${search}%` } },
      { subject: { [Op.iLike]: `%${search}%` } },
      { category: { [Op.iLike]: `%${search}%` } }
    ]
  } : {};

  const { count, rows } = await EmailLog.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });

  return {
    logs: rows,
    meta: buildPaginationMeta(page, limit, count)
  };
};

const getTickets = async ({ page, limit, status }) => {
  const offset = (page - 1) * limit;
  const where = status ? { status } : {};

  const { count, rows } = await Ticket.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });

  return {
    tickets: rows,
    meta: buildPaginationMeta(page, limit, count)
  };
};

const updateTicketStatus = async ({ ticketId, status }) => {
  const ticket = await Ticket.findOne({
    where: { ticket_id: ticketId }
  });

  if (!ticket) {
    throw createHttpError(404, 'Ticket not found');
  }

  const previousStatus = ticket.status;

  ticket.status = status;
  await ticket.save();

  return {
    ticket,
    previousStatus
  };
};

const getAuditLogs = async ({ page, limit }) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await AdminAuditLog.findAndCountAll({
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });

  return {
    auditLogs: rows,
    meta: buildPaginationMeta(page, limit, count)
  };
};

module.exports = {
  getMetrics,
  getEmailLogs,
  getTickets,
  updateTicketStatus,
  getAuditLogs
};