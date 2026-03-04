import cron from 'node-cron';
import { fetchEmailsInternal } from '../services/emailFetcher.js';

cron.schedule('*/1 * * * *', async () => {
  console.log('⏰ Cron triggered: fetching emails');

  try {
    const result = await fetchEmailsInternal();
    console.log('📩 Cron result:', result);
  } catch (err) {
    console.error('❌ Cron error:', err.message);
  }
});