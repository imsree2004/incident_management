import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Complaint = sequelize.define('Complaint', {
  message_id: { type: DataTypes.STRING, allowNull: true, unique: true },

  from: { type: DataTypes.STRING, allowNull: false },
  to: { type: DataTypes.STRING, allowNull: true },
  subject: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },

  attachments: { type: DataTypes.JSON, allowNull: true },

  status: { type: DataTypes.STRING, defaultValue: 'New' },
  severity: { type: DataTypes.STRING, defaultValue: 'Pending' },

department: {
  type: DataTypes.STRING,
  allowNull: true
},
department_confidence: {
  type: DataTypes.FLOAT,
  allowNull: true
},
processing_stage:{
  type:DataTypes.STRING,
  allowNull: false,
  defaultValue: "RAW"
},
  // 🔥 AUTO RESPONSE TRACKING
  autoResponseSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  autoResponseType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  autoResponseTime: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // 🔥 ESCALATION TRACKING
  response_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  escalated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  escalated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // NLP / Processing fields
  processed_meta: { type: DataTypes.JSON, allowNull: true },
  processed_at: { type: DataTypes.DATE, allowNull: true },
  nlp_ready: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  forwarded_to_nlp_at: { type: DataTypes.DATE, allowNull: true },
  forward_payload: { type: DataTypes.JSON, allowNull: true },

  received_at: { type: DataTypes.DATE, allowNull: true }

}, {
  indexes: [
    { fields: ['message_id'] },
    { fields: ['nlp_ready'] }
  ]
});

export default Complaint;
