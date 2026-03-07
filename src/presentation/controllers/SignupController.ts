import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { RequestSignupOtpUseCase } from '../../application/auth/RequestSignupOtpUseCase';
import { VerifySignupOtpUseCase } from '../../application/auth/VerifySignupOtpUseCase';
import { SignupUseCase } from '../../application/auth/SignupUseCase';

@injectable()
export class SignupController {
  constructor(
    @inject(TYPES.RequestSignupOtpUseCase)
    private readonly requestSignupOtpUseCase: RequestSignupOtpUseCase,

    @inject(TYPES.VerifySignupOtpUseCase)
    private readonly verifySignupOtpUseCase: VerifySignupOtpUseCase,

    @inject(TYPES.SignupUseCase)
    private readonly signupUseCase: SignupUseCase,
  ) {}

  async requestOtp(email: string) {
    const expiresAt = await this.requestSignupOtpUseCase.execute(email);
    return { message: 'OTP sent to email', expiresAt };
  }

  async verifyOtp(email: string, otp: string) {
    await this.verifySignupOtpUseCase.execute(email, otp);
    return { message: 'OTP verified successfully' };
  }

  async signup(data: {
    email: string;
    password: string;
    otp: string;
    firstName?: string;
    lastName?: string;
  }) {
    return this.signupUseCase.execute(data);
  }
}