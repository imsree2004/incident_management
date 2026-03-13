import { sendError } from '../utils/apiResponse.js';

const getSequelizeErrorDetails = (error) => error?.errors?.map(({ message, path }) => ({
  field: path,
  message
}));

export const errorMiddleware = (error, req, res, next) => {
  void req;
  void next;

  if (error?.name === 'SequelizeValidationError') {
    return sendError(res, {
      statusCode: 400,
      message: error.errors?.[0]?.message || 'Validation failed',
      details: getSequelizeErrorDetails(error)
    });
  }

  if (error?.name === 'SequelizeUniqueConstraintError') {
    return sendError(res, {
      statusCode: 409,
      message: error.errors?.[0]?.message || 'Resource already exists',
      details: getSequelizeErrorDetails(error)
    });
  }

  const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
  const message = statusCode >= 500
    ? 'Internal server error'
    : error?.message || 'Request failed';

  if (statusCode >= 500) {
    console.error('SUPPORT BACKEND ERROR:', error);
  }

  return sendError(res, {
    statusCode,
    message,
    details: error?.details
  });
};