import cron from 'node-cron';
import Complaint from '../models/Complaint.js';
import { handleAutoResponse } from '../services/autoResponder.js';

let isProcessing = false;

cron.schedule('*/1 * * * *', async () => {

  if (isProcessing) return;
  isProcessing = true;

  console.log('🔍 Checking for Low severity complaints...');

  try {
    const complaints = await Complaint.findAll({
      where: {
        severity: 'Low',
        autoResponseSent: false
      }
    });

    await Promise.all(
  complaints.map(c => handleAutoResponse(c))
);

  } catch (err) {
    console.error('AutoResponse Cron Error:', err.message);
  }

  isProcessing = false;
});