import { preprocessText } from '../services/textPreprocessor.js';
import { saveNLPResult } from '../services/nlpStorageService.js';

export const preprocessComplaint = async (req, res) => {
  try {
    const { complaint_id, subject, body } = req.body;

    const combinedText = `${subject || ''} ${body || ''}`.trim();

    if (!combinedText) {
      return res.status(400).json({ error: 'No valid text provided' });
    }

    const { cleaned_text, tokens } = preprocessText(combinedText);

    if (!cleaned_text) {
      return res.status(400).json({ error: 'Text preprocessing failed' });
    }

    await saveNLPResult(
      complaint_id || null,
      cleaned_text,
      tokens
    );

    res.json({
      complaint_id,
      cleaned_text,
      tokens,
      token_count: tokens.length,
      status: 'Saved to database'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
