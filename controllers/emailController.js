import { fetchEmailsInternal } from '../services/emailFetcher.js';

export const fetchEmails = async (req, res) => {
  try {
    const result = await fetchEmailsInternal();
    res.json({
      message: 'Email fetch triggered manually',
      result
    });
  } catch (err) {
    res.status(500).json({
      error: 'Email fetch failed',
      details: err.message
    });
  }
};
