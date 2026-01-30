

import { injectable } from 'inversify';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

import { redisClient } from '../redis/redis.client';
import { AppError } from '../../shared/errors/AppError';
import { OtpServicePort } from '../../application/ports/OtpServicePort';
import { env } from "../../shared/config/env";

/* -----------------------------
   Types
----------------------------- */

type OtpPurpose = 'signup' | 'forgot-password';

interface CachedOtp {
  hash: string;
  attempts: number;
}

/* -----------------------------
   Constants
----------------------------- */

const OTP_TTL_SECONDS = 120;
const MAX_ATTEMPTS = 5;

/* -----------------------------
   Service
----------------------------- */

@injectable()
export class RedisOtpService implements OtpServicePort {
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  private key(email: string, purpose: OtpPurpose): string {
    return `otp:${purpose}:${email.toLowerCase()}`;
  }

  async requestOtp(email: string, purpose: OtpPurpose): Promise<Date> {
    const otp = this.generateOtp();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.deepLearnEmail,
        pass: env.deepLearnPassword,
      },
    });

    try {
      await transporter.sendMail({
        from: env.deepLearnEmail,
        to: email,
        subject: 'Your OTP Code',
        html: `
          <p>Your OTP is:</p>
          <h2>${otp}</h2>
          <p>This OTP expires in 2 minutes.</p>
        `,
      });
    } catch {
      throw new AppError('Failed to send OTP email', 500);
    }

    try {
      await redisClient.set(
        this.key(email, purpose),
        JSON.stringify({
          hash: this.hashOtp(otp),
          attempts: 0,
        }),
        { EX: OTP_TTL_SECONDS }
      );
    } catch {
      throw new AppError('Failed to store OTP', 500);
    }

    return new Date(Date.now() + OTP_TTL_SECONDS * 1000);
  }

  async verifyOtp(
    email: string,
    purpose: OtpPurpose,
    inputOtp: string
  ): Promise<void> {
    const redisKey = this.key(email, purpose);

    const raw = await redisClient.get(redisKey);
    if (!raw) {
      throw new AppError('OTP expired or invalid', 400);
    }

    const cached: CachedOtp = JSON.parse(raw);

    if (cached.attempts >= MAX_ATTEMPTS) {
      await redisClient.del(redisKey);
      throw new AppError('Too many invalid OTP attempts', 429);
    }

    if (this.hashOtp(inputOtp) !== cached.hash) {
      cached.attempts += 1;

      await redisClient.set(
        redisKey,
        JSON.stringify(cached),
        { EX: OTP_TTL_SECONDS }
      );

      throw new AppError('Invalid OTP', 400);
    }

    await redisClient.del(redisKey);
  }
}
