import './config/env.js';
import express from 'express';
import cors from 'cors';

import sequelize from './config/database.js';

import supportRoutes from './routes/support.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { createHttpError } from './utils/httpError.js';

const app = express();

app.use(cors());
app.use(express.json());

/* ROUTES */

app.use('/api/support/auth', supportRoutes);
app.use('/api/tickets', ticketRoutes);

app.use((req, res, next) => {
  void req;
  void res;
  next(createHttpError(404, 'Route not found'));
});

app.use(errorMiddleware);

/* DATABASE */

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    if (process.env.NODE_ENV !== 'test') {
      await sequelize.sync();
      console.log('✅ Database synced');
    }
  } catch (error) {
    console.error('❌ Database error:', error);
  }
};

/* EXPORT APP */

export default app;

/* START SERVER */

if (process.env.NODE_ENV !== 'test') {
  initializeDatabase();
  const PORT = process.env.PORT || 5001;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}