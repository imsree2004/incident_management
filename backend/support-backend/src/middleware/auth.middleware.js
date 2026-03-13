import { verifyToken } from '../utils/jwt.js';
import { createHttpError } from '../utils/httpError.js';

export const authMiddleware = (req, res, next) => {
  void res;
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(createHttpError(401, 'Authorization token missing'));
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return next(createHttpError(401, 'Authorization token missing'));
  }

  try {
    const decoded = verifyToken(token);

    req.user = decoded;
    return next();

  } catch {
    return next(createHttpError(401, 'Invalid or expired token'));
  }
};

export const supportOnly = (req, res, next) => {
  void res;

  if (req.user?.role !== 'SUPPORT_AGENT') {
    return next(createHttpError(403, 'Access denied'));
  }

  return next();
};