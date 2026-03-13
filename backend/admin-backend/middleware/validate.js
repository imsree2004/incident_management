const { sendError } = require('../utils/apiResponse');

const validate = (target, validator) => (req, res, next) => {
  try {
    req[target] = validator(req[target] || {});
    return next();
  } catch (error) {
    return sendError(res, {
      status: error.status || 400,
      message: error.message || 'Validation failed',
      errors: error.details
    });
  }
};

module.exports = {
  validate
};