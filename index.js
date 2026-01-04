import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/db.js';

dotenv.config();

// cron job
import './cron/emailCron.js';

// routes
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

const app = express();
app.use(express.json());

// routes
app.use('/api', authRoutes);
app.use('/api', emailRoutes);
app.use("/tickets", ticketRoutes);

// health check
app.get('/', (req, res) => {
  res.send('Incident Management Server Running');
});

// debug routes
console.log('--- Registered routes ---');
if (app._router && app._router.stack) {
  app._router.stack
    .filter(r => r.route)
    .forEach(r => {
      const methods = Object.keys(r.route.methods)
        .map(m => m.toUpperCase())
        .join(', ');
      console.log(methods, r.route.path);
    });
}
console.log('-------------------------');

const PORT = process.env.PORT || 5000;

// 🔥 IMPORTANT: DB INIT + SYNC
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
})();
