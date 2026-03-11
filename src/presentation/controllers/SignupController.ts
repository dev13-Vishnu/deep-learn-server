import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { IRequestSignupOtpUseCase } from '../../application/ports/inbound/auth/IRequestSignupOtpUseCase';
import { IVerifySignupOtpUseCase }  from '../../application/ports/inbound/auth/IVerifySignupOtpUseCase';
import { ISignupUseCase }           from '../../application/ports/inbound/auth/ISignupUseCase';

@injectable()
export class SignupController {
  constructor(
    @inject(TYPES.RequestSignupOtpUseCase)
    private readonly requestSignupOtpUseCase: IRequestSignupOtpUseCase,

    @inject(TYPES.VerifySignupOtpUseCase)
    private readonly verifySignupOtpUseCase: IVerifySignupOtpUseCase,

    @inject(TYPES.SignupUseCase)
    private readonly signupUseCase: ISignupUseCase,
  ) {}

  async requestOtp(email: string) {
    const expiresAt = await this.requestSignupOtpUseCase.execute(email);
    return { message: 'OTP sent to email', expiresAt };
  }

  async verifyOtp(email: string, otp: string) {
    await this.verifySignupOtpUseCase.execute(email, otp);
    return { message: 'OTP verified successfully' };
  }

  async signup(data: { email: string; password: string; otp: string; firstName?: string; lastName?: string }) {
    return this.signupUseCase.execute(data);
  }
}