import { injectable } from 'inversify';
import nodemailer from 'nodemailer';
import { EmailServicePort } from '../../application/ports/EmailServicePort';
import { AppError } from '../../shared/errors/AppError';
import { env } from '../../shared/config/env';

@injectable()
export class NodemailerEmailService implements EmailServicePort {
  async sendOtp(to: string, otp: string, expiresInSeconds: number): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.deepLearnEmail,
        pass: env.deepLearnPassword,
      },
    });

    try {
      await transporter.sendMail({
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
      throw new AppError('Failed to send OTP email', 500);
    }
  }
}