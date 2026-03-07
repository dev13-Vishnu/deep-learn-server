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
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  async requestOtp(email: string) {
    await this.requestPasswordResetOtpUseCase.execute(email);
    return { message: 'If the email exists, a verification code has been sent' };
  }

  async verifyOtp(email: string, otp: string) {
    await this.verifyPasswordResetOtpUseCase.execute(email, otp);
    return { message: 'OTP verified successfully' };
  }

  async resetPassword(email: string, password: string) {
    await this.resetPasswordUseCase.execute(email, password);
    return { message: 'Password reset successfully' };
  }
}