const dashboardService = require('../services/dashboardService');
const { recordAdminAction } = require('../services/auditLogService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getMetrics = async (req, res) => {
  try {
    const metrics = await dashboardService.getMetrics();

    return sendSuccess(res, {
      message: 'Dashboard metrics retrieved successfully',
      data: metrics
    });
  } catch (error) {
    return sendError(res, {
      status: error.status || 500,
      message: error.message || 'Failed to retrieve dashboard metrics'
    });
  }
};

exports.getEmailLogs = async (req, res) => {
  try {
    const { logs, meta } = await dashboardService.getEmailLogs(req.query);

    return sendSuccess(res, {
      message: 'Email logs retrieved successfully',
      data: { logs },
      meta
    });
  } catch (error) {
    return sendError(res, {
      status: error.status || 500,
      message: error.message || 'Failed to retrieve email logs'
    });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const { tickets, meta } = await dashboardService.getTickets(req.query);

    return sendSuccess(res, {
      message: 'Tickets retrieved successfully',
      data: { tickets },
      meta
    });
  } catch (error) {
    return sendError(res, {
      status: error.status || 500,
      message: error.message || 'Failed to retrieve tickets'
    });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { ticket, previousStatus } = await dashboardService.updateTicketStatus({
      ticketId: req.params.ticketId,
      status: req.body.status
    });

    await recordAdminAction({
      admin: req.admin,
      action: 'ticket_status_updated',
      entityType: 'ticket',
      entityId: ticket.ticket_id,
      description: `Admin ${req.admin.username} changed ticket ${ticket.ticket_id} status from ${previousStatus} to ${ticket.status}`,
      previousValue: { status: previousStatus },
      newValue: { status: ticket.status }
    });

    return sendSuccess(res, {
      message: 'Ticket status updated successfully',
      data: { ticket }
    });
  } catch (error) {
    return sendError(res, {
      status: error.status || 500,
      message: error.message || 'Failed to update ticket status'
    });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { auditLogs, meta } = await dashboardService.getAuditLogs(req.query);

    return sendSuccess(res, {
      message: 'Audit logs retrieved successfully',
      data: { auditLogs },
      meta
    });
  } catch (error) {
    return sendError(res, {
      status: error.status || 500,
      message: error.message || 'Failed to retrieve audit logs'
    });
  }
};