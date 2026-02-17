import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';

import supportRoutes from './routes/support.routes.js';
import ticketRoutes from './routes/ticket.routes.js';

dotenv.config();

const app = express();            // ✅ app initialized FIRST
const PORT = process.env.PORT || 4000;

// ===== Middlewares =====
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// ===== Routes =====
app.use('/api/support', supportRoutes);
app.use('/api/tickets', ticketRoutes);


// ===== Health check (optional but useful) =====
app.get('/', (req, res) => {
  res.send('Support Portal Backend is running');
});

// ===== Start server =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
