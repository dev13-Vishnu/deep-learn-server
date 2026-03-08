import { inject, injectable } from "inversify";
import { OtpServicePort } from "../ports/OtpServicePort";
import { TYPES } from "../../shared/di/types";
import { IVerifySignupOtpUseCase } from "../ports/inbound/auth/IVerifySignupOtpUseCase";

@injectable()
export class VerifySignupOtpUseCase implements IVerifySignupOtpUseCase {
  constructor(
    @inject(TYPES.OtpServicePort)
    private readonly otpService: OtpServicePort
  ) {}

  async execute(email: string, otp: string): Promise<void> {
    await this.otpService.verifyOtp(email, otp, "signup");
  }
}
