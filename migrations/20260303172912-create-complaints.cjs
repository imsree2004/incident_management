'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Complaints', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      message_id: {
        type: Sequelize.STRING,
        unique: true
      },

      from: Sequelize.STRING,
      to: Sequelize.STRING,
      subject: Sequelize.STRING,
      body: Sequelize.TEXT,

      attachments: Sequelize.JSON,

      status: {
        type: Sequelize.STRING,
        defaultValue: 'New'
      },

      severity: {
        type: Sequelize.STRING,
        defaultValue: 'Pending'
      },

      department: Sequelize.STRING,

      processing_stage: {
        type: Sequelize.STRING,
        defaultValue: 'RAW'
      },

      autoResponseSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      autoResponseType: Sequelize.STRING,

      autoResponseTime: Sequelize.DATE,

      response_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      escalated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      escalated_at: Sequelize.DATE,

      processed_meta: Sequelize.JSON,

      processed_at: Sequelize.DATE,

      nlp_ready: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      forwarded_to_nlp_at: Sequelize.DATE,

      forward_payload: Sequelize.JSON,

      received_at: Sequelize.DATE,

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Complaints');
  }
};