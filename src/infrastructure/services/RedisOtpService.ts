import { injectable, inject } from 'inversify';
import crypto from 'crypto';
import { TYPES } from '../../shared/di/types';
import { RedisClientPort } from '../../application/ports/RedisClientPort';
import { EmailServicePort } from '../../application/ports/EmailServicePort';
import { AppError } from '../../shared/errors/AppError';
import { OtpServicePort } from '../../application/ports/OtpServicePort';

type OtpPurpose = 'signup' | 'forgot-password';

interface CachedOtp {
  hash: string;
  attempts: number;
}

const OTP_TTL_SECONDS = 120;
const MAX_ATTEMPTS    = 5;

@injectable()
export class RedisOtpService implements OtpServicePort {
  constructor(
    @inject(TYPES.RedisClientPort)
    private readonly redis: RedisClientPort,

    @inject(TYPES.EmailServicePort)
    private readonly emailService: EmailServicePort,
  ) {}

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
    const otp   = this.generateOtp();
    const hash  = this.hashOtp(otp);
    const entry: CachedOtp = { hash, attempts: 0 };

    await this.redis.setEx(this.key(email, purpose), OTP_TTL_SECONDS, JSON.stringify(entry));
    await this.emailService.sendOtp(email, otp, OTP_TTL_SECONDS);

    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);
    return expiresAt;
  }

  async verifyOtp(email: string, otp: string, purpose: OtpPurpose): Promise<void> {
    const raw = await this.redis.get(this.key(email, purpose));

    if (!raw) {
      throw new AppError('OTP expired or not found', 400);
    }

    const entry: CachedOtp = JSON.parse(raw);

    if (entry.attempts >= MAX_ATTEMPTS) {
      await this.redis.del(this.key(email, purpose));
      throw new AppError('Too many failed attempts. Please request a new OTP', 429);
    }

    if (entry.hash !== this.hashOtp(otp)) {
      entry.attempts += 1;
      await this.redis.setEx(this.key(email, purpose), OTP_TTL_SECONDS, JSON.stringify(entry));
      throw new AppError('Invalid OTP', 400);
    }

    await this.redis.del(this.key(email, purpose));
  }
}