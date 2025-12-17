import cron from 'node-cron';
import { fetchEmailsInternal } from '../services/emailFetcher.js';

cron.schedule('*/5 * * * *', async () => {
  console.log('⏰ Running email fetch cron...');
  try {
    await fetchEmailsInternal();
  } catch (err) {
    console.error('Cron email fetch failed:', err.message);
  }
});
