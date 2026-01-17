// models/Complaint.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Complaint = sequelize.define('Complaint', {
  message_id: { type: DataTypes.STRING, allowNull: true, unique: true }, // IMAP message-id
  from: { type: DataTypes.STRING, allowNull: false },
  to: { type: DataTypes.STRING, allowNull: true },
  subject: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  attachments: { type: DataTypes.JSON, allowNull: true }, // [{filename, contentType, url}]
  status: { type: DataTypes.STRING, defaultValue: 'New' },
  severity: { type: DataTypes.STRING, defaultValue: 'Pending' },

  // Extraction fields
  processed_meta: { type: DataTypes.JSON, allowNull: true },
  processed_at: { type: DataTypes.DATE, allowNull: true },
  nlp_ready: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  forwarded_to_nlp_at: { type: DataTypes.DATE, allowNull: true },
  forward_payload: { type: DataTypes.JSON, allowNull: true },

  // store receive timestamp
  received_at: { type: DataTypes.DATE, allowNull: true },
  ticket_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  indexes: [
    { fields: ['message_id'] },
    { fields: ['nlp_ready'] }
  ]
});

export default Complaint;
