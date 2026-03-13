import { Op } from 'sequelize';
import Ticket from '../models/Ticket.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { createHttpError } from '../utils/httpError.js';

const RESOLVED_STATUSES = ['RESOLVED', 'CLOSED'];
const PENDING_STATUSES = ['PENDING', 'IN_PROGRESS'];
const VALID_TICKET_STATUSES = ['OPEN', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const VALID_SORT_FIELDS = new Set(['id', 'summary', 'severity', 'status', 'createdAt', 'updatedAt']);
const VALID_SORT_ORDERS = new Set(['ASC', 'DESC']);
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const normalizeUppercase = (value) => (
  typeof value === 'string' ? value.trim().toUpperCase() : ''
);

const parsePositiveInteger = (value, fieldName) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw createHttpError(400, `${fieldName} must be a positive integer`);
  }

  return parsedValue;
};

const getTicketId = (ticketId) => parsePositiveInteger(ticketId, 'Ticket id');

const getPaginationValue = (value, fieldName, defaultValue, maxValue) => {
  if (value === undefined) {
    return defaultValue;
  }

  const parsedValue = parsePositiveInteger(value, fieldName);

  if (parsedValue > maxValue) {
    throw createHttpError(400, `${fieldName} must not exceed ${maxValue}`);
  }

  return parsedValue;
};

const getSortBy = (sortBy) => {
  if (sortBy === undefined) {
    return 'createdAt';
  }

  if (!VALID_SORT_FIELDS.has(sortBy)) {
    throw createHttpError(400, `sortBy must be one of: ${Array.from(VALID_SORT_FIELDS).join(', ')}`);
  }

  return sortBy;
};

const getSortOrder = (sortOrder) => {
  if (sortOrder === undefined) {
    return 'DESC';
  }

  const normalizedSortOrder = normalizeUppercase(sortOrder);

  if (!VALID_SORT_ORDERS.has(normalizedSortOrder)) {
    throw createHttpError(400, 'sortOrder must be ASC or DESC');
  }

  return normalizedSortOrder;
};

const getTicketFilters = (query) => {
  const status = query.status === undefined ? null : normalizeUppercase(query.status);
  const severity = query.severity === undefined ? null : normalizeUppercase(query.severity);
  const search = typeof query.search === 'string' ? query.search.trim() : '';

  if (status && !VALID_TICKET_STATUSES.includes(status)) {
    throw createHttpError(400, 'Invalid ticket status filter');
  }

  if (query.severity !== undefined && !severity) {
    throw createHttpError(400, 'Severity filter cannot be empty');
  }

  return {
    status,
    severity,
    search: search || null
  };
};

const getSearchOperator = () => (
  Ticket.sequelize?.getDialect?.() === 'postgres' ? Op.iLike : Op.like
);

export const createTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.create(req.body);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Ticket created successfully',
    data: { ticketId: ticket.id }
  });
});


/* GET ALL TICKETS (LIST VIEW) */
export const getTickets = asyncHandler(async (req, res) => {
  const page = getPaginationValue(req.query.page, 'page', 1, 100000);
  const limit = getPaginationValue(req.query.limit, 'limit', DEFAULT_LIMIT, MAX_LIMIT);
  const sortBy = getSortBy(req.query.sortBy);
  const sortOrder = getSortOrder(req.query.sortOrder);
  const filters = getTicketFilters(req.query);
  const offset = (page - 1) * limit;
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.severity) {
    where.severity = filters.severity;
  }

  if (filters.search) {
    const searchOperator = getSearchOperator();

    where[Op.or] = [
      { summary: { [searchOperator]: `%${filters.search}%` } },
      { originalEmail: { [searchOperator]: `%${filters.search}%` } },
      { category: { [searchOperator]: `%${filters.search}%` } }
    ];
  }

  const { count, rows } = await Ticket.findAndCountAll({
    attributes: ['id', 'summary', 'severity', 'status'],
    where,
    limit,
    offset,
    order: [[sortBy, sortOrder]]
  });

  return sendSuccess(res, {
    message: 'Tickets retrieved successfully',
    data: {
      tickets: rows
    },
    meta: {
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit) || 1,
      sortBy,
      sortOrder,
      filters
    }
  });
});

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [openTickets, pendingTickets, resolvedTickets, resolvedToday] = await Promise.all([
    Ticket.count({ where: { status: 'OPEN' } }),
    Ticket.count({ where: { status: { [Op.in]: PENDING_STATUSES } } }),
    Ticket.count({ where: { status: { [Op.in]: RESOLVED_STATUSES } } }),
    Ticket.count({
      where: {
        status: { [Op.in]: RESOLVED_STATUSES },
        updatedAt: { [Op.gte]: startOfToday }
      }
    })
  ]);

  return sendSuccess(res, {
    message: 'Dashboard metrics retrieved successfully',
    data: {
      assignedTickets: openTickets + pendingTickets,
      openTickets,
      pendingTickets,
      resolvedTickets,
      resolvedToday
    }
  });
});

/* GET SINGLE TICKET (DETAIL VIEW) */
export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByPk(getTicketId(req.params.id));

  if (!ticket) {
    throw createHttpError(404, 'Ticket not found');
  }

  return sendSuccess(res, {
    message: 'Ticket retrieved successfully',
    data: {
      id: ticket.id,
      status: ticket.status,
      aiSummary: {
        category: ticket.category,
        severity: ticket.severity,
        confidence: ticket.confidence,
        description: ticket.summary
      },
      aiInsights: ticket.aiInsights,
      originalEmail: ticket.originalEmail
    }
  });
});

/* UPDATE STATUS */
export const updateStatus = asyncHandler(async (req, res) => {
  const ticketId = getTicketId(req.params.id);
  const status = normalizeUppercase(req.body?.status);

  if (!VALID_TICKET_STATUSES.includes(status)) {
    throw createHttpError(400, 'Invalid ticket status');
  }

  const ticket = await Ticket.findByPk(ticketId);

  if (!ticket) {
    throw createHttpError(404, 'Ticket not found');
  }

  ticket.status = status;
  await ticket.save();

  return sendSuccess(res, {
    message: 'Status updated',
    data: {
      id: ticket.id,
      status: ticket.status
    }
  });
});

/* SEND REPLY */
export const sendReply = asyncHandler(async (req, res) => {
  const ticketId = getTicketId(req.params.id);
  const replyText = typeof req.body?.replyText === 'string' ? req.body.replyText.trim() : '';

  if (!replyText) {
    throw createHttpError(400, 'Reply text is required');
  }

  const ticket = await Ticket.findByPk(ticketId);

  if (!ticket) {
    throw createHttpError(404, 'Ticket not found');
  }

  ticket.draftReply = replyText;
  await ticket.save();

  return sendSuccess(res, {
    message: 'Reply sent',
    data: {
      id: ticket.id,
      draftReply: ticket.draftReply
    }
  });
});
