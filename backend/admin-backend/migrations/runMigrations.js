require('dotenv').config();

const sequelize = require('../config/database');
const { runPendingMigrations } = require('../services/migrationService');

(async () => {
  try {
    await sequelize.authenticate();
    await runPendingMigrations(sequelize);
    console.log('✅ Admin backend migrations completed successfully');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to run admin backend migrations:', error.message);
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
})();