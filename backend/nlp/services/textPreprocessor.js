import natural from 'natural';
import stopword from 'stopword';

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

export const preprocessText = (text) => {

  // 1️⃣ Lowercasing
  let processedText = text.toLowerCase();

  // 2️⃣ Noise removal (punctuation & special chars)
  processedText = processedText.replace(/[^\w\s]/g, ' ');

  // 3️⃣ Tokenization
  let tokens = tokenizer.tokenize(processedText);

  // 4️⃣ Stopword removal
  tokens = stopword.removeStopwords(tokens);

  // 5️⃣ Stemming
  tokens = tokens.map(token => stemmer.stem(token));

  return {
    cleaned_text: tokens.join(' '),
    tokens
  };
};
