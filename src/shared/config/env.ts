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

function requireNumberEnv(key: string): number{
  const value = Number(requireEnv(key));
  if(Number.isNaN(value)){
    throw new Error(`Environment variable ${key} must be a number`)
  }
  return value;
}

export const env = {
  // Server
  port: Number(requireEnv('PORT')),
  frontendOrigin: requireEnv('FRONTEND_ORIGIN'),
  nodeEnv: requireEnv('NODE_ENV'),

  // Database
  mongoUri: requireEnv('MONGO_URI'),

  // Redis (RESTORED)
  redisHost: requireEnv('REDIS_HOST'),
  redisPort: requireNumberEnv('REDIS_PORT'),
  redisPassword: process.env.REDIS_PASSWORD, // optional

  // Auth / Security
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ??
    '1d') as SignOptions['expiresIn'],

  //nodemailer
  deepLearnEmail: requireEnv('DEEP_LEARN_EMAIL'),
  deepLearnPassword: requireEnv('DEEP_LEARN_PASS'),
  
  //s3
  storageProvider: requireEnv('STORAGE_PROVIDER'),
  awsRegion: requireEnv('AWS_REGION'),
  awsAccessKeyId: requireEnv('AWS_ACCESS_KEY_ID'),
  awsSecretAccessKey:requireEnv('AWS_SECRET_ACCESS_KEY'),
  awsBucketName: requireEnv('AWS_BUCKET_NAME')
};
