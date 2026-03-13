const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const { sendSuccess, sendError } = require('./utils/apiResponse');
const { runPendingMigrations } = require('./services/migrationService');

dotenv.config();

const app = express();

require('./models');

const allowedOriginPatterns = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : (process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost', 'http://127.0.0.1']);

const isOriginAllowed = (origin) => {
  if (!origin) {
    return true;
  }

  return allowedOriginPatterns.some((allowedOrigin) => {
    if (allowedOrigin.endsWith(':*')) {
      const baseOrigin = allowedOrigin.slice(0, -2);
      return origin.startsWith(baseOrigin + ':');
    }

    if (!process.env.CORS_ORIGINS && (allowedOrigin === 'http://localhost' || allowedOrigin === 'http://127.0.0.1')) {
      return origin.startsWith(`${allowedOrigin}:`);
    }

    return origin === allowedOrigin;
  });
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS origin is not allowed'));
  }
};

// --------------------
// Middleware
// --------------------
app.use(cors(corsOptions));
app.use(express.json());

// --------------------
// Routes
// --------------------
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const protectedRoutes = require('./routes/protectedRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', protectedRoutes);

// --------------------
// Test Route
// --------------------
app.get('/api/test', (req, res) => {
  return sendSuccess(res, {
    message: 'Backend server is running!',
    data: { status: 'ok' }
  });
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    if (process.env.NODE_ENV !== 'test') {
      if (process.env.AUTO_RUN_MIGRATIONS === 'true') {
        await runPendingMigrations(sequelize);
        console.log('✅ Pending migrations applied');
      } else {
        console.log('ℹ️ Automatic migrations are disabled. Run "npm run migrate" to apply pending schema changes.');
      }
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('⚠️ Server started without DB connection');
  }
})();

// --------------------
// Global Error Handler
// --------------------
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);

  return sendError(res, {
    status: err.status || 500,
    message: err.message || 'Internal Server Error',
    errors: err.details
  });
});

// --------------------
// Server
// --------------------
const PORT = process.env.PORT || 5000;

// Export app for tests
module.exports = app;

// Start server only if not testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}