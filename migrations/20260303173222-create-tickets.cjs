'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tickets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ticket_number: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      email_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Complaints",
        key: "id"
      },
      onDelete: "CASCADE"
      },
      subject: Sequelize.STRING,
      summary: Sequelize.TEXT,
      status: {
        type: Sequelize.STRING,
        defaultValue: "OPEN"
      },
      severity: Sequelize.STRING,
      department: Sequelize.STRING,
      confidence: Sequelize.FLOAT,
      assigned_to: Sequelize.STRING,
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
    await queryInterface.dropTable('Tickets');
  }
};