const sequelize = require('../config/database');

const Admin = require('./Admin');
const AdminAuditLog = require('./AdminAuditLog');
const EmailLog = require('./EmailLog');
const Ticket = require('./Ticket');

const models = {
sequelize,
Admin,
AdminAuditLog,
EmailLog,
Ticket
};

module.exports = models;
