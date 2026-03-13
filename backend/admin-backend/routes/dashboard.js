const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  validateEmailLogQuery,
  validateTicketQuery,
  validateAuditLogQuery,
  validateTicketIdParam,
  validateTicketStatusBody
} = require('../validators/adminSchemas');
const {
  getMetrics,
  getEmailLogs,
  getTickets,
  updateTicketStatus,
  getAuditLogs
} = require('../controllers/dashboardController');

router.get('/metrics', verifyToken, getMetrics);

router.get('/email-logs', verifyToken, validate('query', validateEmailLogQuery), getEmailLogs);

router.get('/tickets', verifyToken, validate('query', validateTicketQuery), getTickets);

router.get('/audit-logs', verifyToken, validate('query', validateAuditLogQuery), getAuditLogs);

router.put(
  '/tickets/:ticketId',
  verifyToken,
  validate('params', validateTicketIdParam),
  validate('body', validateTicketStatusBody),
  updateTicketStatus
);

module.exports = router;