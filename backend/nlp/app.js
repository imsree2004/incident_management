import express from 'express';
import nlpRoutes from './routes/nlpRoutes.js';
import { initDB } from './models/index.js';

const app = express();
app.use(express.json());

app.use('/nlp', nlpRoutes);

const PORT = 6000;

app.listen(PORT, async () => {
  await initDB();
  console.log(`NLP service running on port ${PORT}`);
});
