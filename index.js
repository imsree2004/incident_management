import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

// ✅ IMPORT ROUTES (MATCH FILE NAMES EXACTLY)
import authRoutes from './routes/authRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

const app = express();
app.use(express.json());

// ✅ MOUNT ROUTES
app.use('/api', authRoutes);
app.use('/api', emailRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Incident Management Server Running');
});

// Debug: show routes
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
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
