const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { sendSuccess } = require('../utils/apiResponse');

router.get('/protected', verifyToken, (req, res) => {
  return sendSuccess(res, {
    message: 'Access granted',
    data: {
      adminId: req.adminId,
      username: req.admin.username
    }
  });
});

module.exports = router;