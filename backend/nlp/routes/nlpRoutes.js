import express from 'express';
import { preprocessComplaint } from '../controllers/nlpController.js';

const router = express.Router();

router.post('/preprocess', preprocessComplaint);

export default router;
