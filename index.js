import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import Complaint from './models/Complaint.js';


dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/emails', emailRoutes);

app.get('/', (req, res) => res.send('Incident Management API is running 🚀'));

// Sync DB
sequelize.sync({ alter: true })
  .then(() => console.log('Database connected and synced'))
  .catch((err) => console.error('DB Error:', err));

// Start server
app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);



