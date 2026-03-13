const { createHttpError } = require('../utils/httpError');

const ALLOWED_TICKET_STATUSES = ['open', 'pending', 'resolved', 'closed', 'in_progress'];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validationError = (message, details) => createHttpError(400, message, details);

const requireTrimmedString = (value, field, label, { min = 1, max = 255 } = {}) => {
  const normalized = typeof value === 'string' ? value.trim() : '';

  if (!normalized) {
    throw validationError(`${label} is required`, [{ field, message: `${label} is required` }]);
  }

  if (normalized.length < min || normalized.length > max) {
    throw validationError(`${label} must be between ${min} and ${max} characters`, [{
      field,
      message: `${label} must be between ${min} and ${max} characters`
    }]);
  }

  return normalized;
};

const optionalTrimmedString = (value, { max = 120, normalizeCase } = {}) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const normalized = String(value).trim();

  if (normalized.length > max) {
    throw validationError(`Query value exceeds maximum length of ${max}`, [{
      field: 'query',
      message: `Query value exceeds maximum length of ${max}`
    }]);
  }

  return normalizeCase === 'lower' ? normalized.toLowerCase() : normalized;
};

const parsePositiveInteger = (value, field, defaultValue, { min = 1, max = 100 } = {}) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const parsed = Number.parseInt(String(value), 10);

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw validationError(`${field} must be an integer between ${min} and ${max}`, [{
      field,
      message: `${field} must be an integer between ${min} and ${max}`
    }]);
  }

  return parsed;
};

const buildPaginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: total === 0 ? 0 : Math.ceil(total / limit)
});

const validateRegisterBody = (body) => {
  const username = requireTrimmedString(body.username, 'username', 'Username', { min: 3, max: 50 });
  const email = requireTrimmedString(body.email, 'email', 'Email', { min: 5, max: 120 }).toLowerCase();
  const password = requireTrimmedString(body.password, 'password', 'Password', { min: 6, max: 255 });

  if (!emailRegex.test(email)) {
    throw validationError('Invalid email format', [{
      field: 'email',
      message: 'Invalid email format'
    }]);
  }

  return { username, email, password };
};

const validateLoginBody = (body) => ({
  username: requireTrimmedString(body.username, 'username', 'Username', { min: 3, max: 50 }),
  password: requireTrimmedString(body.password, 'password', 'Password', { min: 6, max: 255 })
});

const validateEmailLogQuery = (query) => ({
  page: parsePositiveInteger(query.page, 'page', 1, { min: 1, max: 10000 }),
  limit: parsePositiveInteger(query.limit, 'limit', 10, { min: 1, max: 100 }),
  search: optionalTrimmedString(query.search, { max: 120 })
});

const validateTicketQuery = (query) => {
  const status = optionalTrimmedString(query.status, { max: 30, normalizeCase: 'lower' });

  if (status && !ALLOWED_TICKET_STATUSES.includes(status)) {
    throw validationError('Invalid ticket status filter', [{
      field: 'status',
      message: `Status must be one of: ${ALLOWED_TICKET_STATUSES.join(', ')}`
    }]);
  }

  return {
    page: parsePositiveInteger(query.page, 'page', 1, { min: 1, max: 10000 }),
    limit: parsePositiveInteger(query.limit, 'limit', 10, { min: 1, max: 100 }),
    status
  };
};

const validateAuditLogQuery = (query) => ({
  page: parsePositiveInteger(query.page, 'page', 1, { min: 1, max: 10000 }),
  limit: parsePositiveInteger(query.limit, 'limit', 10, { min: 1, max: 100 })
});

const validateTicketIdParam = (params) => ({
  ticketId: requireTrimmedString(params.ticketId, 'ticketId', 'Ticket ID', { min: 2, max: 80 })
});

const validateTicketStatusBody = (body) => {
  const status = requireTrimmedString(body.status, 'status', 'Status', { min: 2, max: 30 }).toLowerCase();

  if (!ALLOWED_TICKET_STATUSES.includes(status)) {
    throw validationError('Invalid ticket status', [{
      field: 'status',
      message: `Status must be one of: ${ALLOWED_TICKET_STATUSES.join(', ')}`
    }]);
  }

  return { status };
};

module.exports = {
  ALLOWED_TICKET_STATUSES,
  buildPaginationMeta,
  validateRegisterBody,
  validateLoginBody,
  validateEmailLogQuery,
  validateTicketQuery,
  validateAuditLogQuery,
  validateTicketIdParam,
  validateTicketStatusBody
};