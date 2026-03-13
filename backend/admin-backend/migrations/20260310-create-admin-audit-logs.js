module.exports = {
  id: '20260310-create-admin-audit-logs',
  up: async ({ queryInterface, Sequelize, transaction }) => {
    await queryInterface.createTable('admin_audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      entity_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      entity_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      previous_value: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      new_value: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      performed_by: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      performed_by_username: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date()
      }
    }, { transaction });
  }
};