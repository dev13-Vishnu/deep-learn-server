import { injectable, inject } from 'inversify';
import nodemailer, { Transporter } from 'nodemailer';
import { EmailServicePort } from '../../application/ports/EmailServicePort';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { EmailConfig } from '../../shared/config/types/EmailConfig';
import { TYPES } from '../../shared/di/types';

@injectable()
export class NodemailerEmailService implements EmailServicePort {
  private readonly transporter: Transporter;

  constructor(
    @inject(TYPES.EmailConfig)
    private readonly config: EmailConfig,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  async sendOtp(to: string, otp: string, expiresInSeconds: number): Promise<void> {
    try {
      await this.transporter.sendMail({
        from:    this.config.user,
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