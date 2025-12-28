import dotenv from 'dotenv';
import { SignOptions } from 'jsonwebtoken';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  // Server
  port: Number(requireEnv('PORT')),
  nodeEnv: requireEnv('NODE_ENV'),

  // Database
  mongoUri: requireEnv('MONGO_URI'),

  // Auth / Security
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ??
    '1d') as SignOptions['expiresIn'],
};
