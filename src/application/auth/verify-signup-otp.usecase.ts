import { OtpServicePort } from "../ports/OtpServicePort";

export class VerifySignupOtpUseCase {
  constructor(
    private readonly otpService: OtpServicePort
  ) {}

  async execute(email: string, otp: string): Promise<void> {
    await this.otpService.verifyOtp(email, otp, "signup");
  }
}
