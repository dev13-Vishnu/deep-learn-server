import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { IRequestPasswordResetOtpUseCase } from '../../application/ports/inbound/auth/IRequestPasswordResetOtpUseCase';
import { IVerifyPasswordResetOtpUseCase }  from '../../application/ports/inbound/auth/IVerifyPasswordResetOtpUseCase';
import { IResetPasswordUseCase }           from '../../application/ports/inbound/auth/IResetPasswordUseCase';

@injectable()
export class PasswordResetController {
  constructor(
    @inject(TYPES.RequestPasswordResetOtpUseCase)
    private readonly requestPasswordResetOtpUseCase: IRequestPasswordResetOtpUseCase,

    @inject(TYPES.VerifyPasswordResetOtpUseCase)
    private readonly verifyPasswordResetOtpUseCase: IVerifyPasswordResetOtpUseCase,

    @inject(TYPES.ResetPasswordUseCase)
    private readonly resetPasswordUseCase: IResetPasswordUseCase,
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