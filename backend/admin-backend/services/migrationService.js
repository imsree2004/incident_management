const fs = require('fs');
const path = require('path');
const { DataTypes, QueryTypes } = require('sequelize');

const ensureMigrationsTable = async (sequelize) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.createTable('schema_migrations', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    applied_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }).catch(async (error) => {
    const tableExists = error?.original?.code === '42P07' || /already exists/i.test(error.message || '');

    if (!tableExists) {
      throw error;
    }
  });
};

const loadMigrationFiles = (migrationsDir) => fs.readdirSync(migrationsDir)
  .filter(fileName => fileName.endsWith('.js') && fileName !== 'runMigrations.js')
  .sort();

const runPendingMigrations = async (sequelize, migrationsDir = path.join(__dirname, '..', 'migrations')) => {
  await ensureMigrationsTable(sequelize);

  const appliedRows = await sequelize.query(
    'SELECT id FROM schema_migrations ORDER BY applied_at ASC',
    { type: QueryTypes.SELECT }
  );

  const appliedIds = new Set(appliedRows.map(row => row.id));
  const queryInterface = sequelize.getQueryInterface();
  const migrationFiles = loadMigrationFiles(migrationsDir);

  for (const fileName of migrationFiles) {
    const migrationPath = path.join(migrationsDir, fileName);
    delete require.cache[require.resolve(migrationPath)];
    const migration = require(migrationPath);

    if (appliedIds.has(migration.id)) {
      continue;
    }

    const transaction = await sequelize.transaction();

    try {
      await migration.up({
        queryInterface,
        Sequelize: DataTypes,
        transaction
      });

      await queryInterface.bulkInsert('schema_migrations', [{
        id: migration.id,
        applied_at: new Date()
      }], { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

module.exports = {
  runPendingMigrations
};