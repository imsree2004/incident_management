import { ComplaintNLP } from '../models/index.js';

export const saveNLPResult = async (complaint_id, cleaned_text, tokens) => {
  return ComplaintNLP.create({
    complaint_id,
    cleaned_text,
    tokens: JSON.stringify(tokens)
  });
};
