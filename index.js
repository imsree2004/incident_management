import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import cron from "node-cron";
import { startEmailListener } from './services/emailListener.js';
import {
  processNLP,
  processML,
  processTickets
} from "./services/processor.js";

dotenv.config();

// cron job
//import './cron/emailCron.js';


const app = express();

// routes
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/dashboard", dashboardRoutes);
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
console.log("✅ Tables created");

startEmailListener();

    /*await sequelize.sync({ alter: true });
    console.log('✅ Database synced');*/

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } 

  /*cron.schedule("*./1 * * * *", async () => {
  console.log("⏳ Checking DB for pending NLP tasks...");
  await processPendingComplaints();
}); */

/*cron.schedule("*./15 * * * * *", async () => {
  await processOneComplaint();
});*/

cron.schedule("*/10 * * * * *", async () => {
  await processNLP();
});

// ML every 12 sec
cron.schedule("*/12 * * * * *", async () => {
  await processML();
});

// Ticket every 15 sec
cron.schedule("*/15 * * * * *", async () => {
  await processTickets();
});

})();


