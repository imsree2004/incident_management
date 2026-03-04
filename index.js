import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import { startEmailListener } from './services/emailListener.js';

dotenv.config();

import './cron/autoResponseCron.js';

// routes
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

const app = express();
app.use(express.json());

// routes
app.use('/api', authRoutes);
app.use('/api', emailRoutes);

// health check
app.get('/', (req, res) => {
  res.send('Incident Management Server Running');
});

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on ${PORT}`);

      // 🚀 START EMAIL LISTENER AFTER SERVER STARTS
      startEmailListener();
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
})();