import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { RequestPasswordResetOtpUseCase } from '../../application/auth/RequestPasswordResetOtpUseCase';
import { VerifyPasswordResetOtpUseCase } from '../../application/auth/VerifyPasswordResetOtpUseCase';
import { ResetPasswordUseCase } from '../../application/auth/ResetPasswordUseCase';

@injectable()
export class PasswordResetController {
  constructor(
    @inject(TYPES.RequestPasswordResetOtpUseCase)
    private readonly requestPasswordResetOtpUseCase: RequestPasswordResetOtpUseCase,

    @inject(TYPES.VerifyPasswordResetOtpUseCase)
    private readonly verifyPasswordResetOtpUseCase: VerifyPasswordResetOtpUseCase,

    @inject(TYPES.ResetPasswordUseCase)
    private readonly resetPasswordUseCase: ResetPasswordUseCase
  ) {}

  async requestOtp(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    await this.requestPasswordResetOtpUseCase.execute(email);

    return res.status(200).json({
      message: 'If the email exists, a verification code has been sent',
    });
  }

  async verifyOtp(req: Request, res: Response): Promise<Response> {
    const { email, otp } = req.body;

    await this.verifyPasswordResetOtpUseCase.execute(email, otp);

    return res.status(200).json({
      message: 'OTP verified successfully',
    });
  }

  async resetPassword(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    await this.resetPasswordUseCase.execute(email, password);

    return res.status(200).json({
      message: 'Password reset successfully',
    });
  }
}