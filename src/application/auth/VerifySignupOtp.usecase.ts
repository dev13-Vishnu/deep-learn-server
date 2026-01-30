import { inject, injectable } from "inversify";
import { OtpServicePort } from "../ports/OtpServicePort";
import { TYPES } from "../../shared/di/types";

@injectable()
export class VerifySignupOtpUseCase {
  constructor(
    @inject(TYPES.OtpServicePort)
    private readonly otpService: OtpServicePort
  ) {}

  async execute(email: string, otp: string): Promise<void> {
    await this.otpService.verifyOtp(email, otp, "signup");
  }
}
