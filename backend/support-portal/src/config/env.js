import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly point to project root .env
dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});
//test change