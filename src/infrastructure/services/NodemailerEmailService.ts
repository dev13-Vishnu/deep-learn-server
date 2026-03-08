import { injectable } from 'inversify';
import nodemailer, { Transporter } from 'nodemailer';
import { EmailServicePort } from '../../application/ports/EmailServicePort';
import { env } from '../../shared/config/env';
import { ApplicationError } from '../../shared/errors/ApplicationError';

@injectable()
export class NodemailerEmailService implements EmailServicePort {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.deepLearnEmail,
        pass: env.deepLearnPassword,
      },
    });
  }

  async sendOtp(to: string, otp: string, expiresInSeconds: number): Promise<void> {
    try {
      await this.transporter.sendMail({
        from:    env.deepLearnEmail,
        to,
        subject: 'Your OTP Code',
        html: `
          <p>Your OTP is:</p>
          <h2>${otp}</h2>
          <p>This OTP expires in ${Math.floor(expiresInSeconds / 60)} minutes.</p>
        `,
      });
    } catch {
     throw new ApplicationError('EMAIL_SEND_FAILED', 'Failed to send OTP email');
    }
  }
}