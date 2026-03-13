const sendSuccess = (res, {
  status = 200,
  message = 'Request completed successfully',
  data,
  meta
} = {}) => {
  const payload = { success: true, message };

  if (data !== undefined) {
    payload.data = data;
  }

  if (meta) {
    payload.meta = meta;
  }

  return res.status(status).json(payload);
};

const sendError = (res, {
  status = 500,
  message = 'Internal Server Error',
  errors
} = {}) => {
  const payload = {
    success: false,
    message
  };

  if (errors?.length) {
    payload.errors = errors;
  }

  return res.status(status).json(payload);
};

module.exports = {
  sendSuccess,
  sendError
};