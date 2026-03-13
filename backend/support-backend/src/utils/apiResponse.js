export const sendSuccess = (
  res,
  { statusCode = 200, message = 'Request successful', data, meta } = {}
) => {
  const payload = {
    success: true,
    message
  };

  if (data !== undefined) {
    payload.data = data;
  }

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

export const sendError = (
  res,
  { statusCode = 500, message = 'Request failed', details } = {}
) => {
  const payload = {
    success: false,
    message
  };

  if (details !== undefined) {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
};