import dotenv from 'dotenv';

dotenv.config();

process.env.JWT_SECRET ??= 'testsecret';