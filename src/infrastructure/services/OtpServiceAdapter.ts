import { OtpServicePort, OtpPurpose } from '../../application/ports/OtpServicePort';
import { OTPService } from '../../services/otp.service';

export class OtpServiceAdapter implements OtpServicePort {
  private readonly otpService = new OTPService();

  async requestOtp(email: string, purpose: OtpPurpose): Promise<void> {
    await this.otpService.sendOtp(email, purpose);
  }

  async verifyOtp(email: string, otp: string, purpose: OtpPurpose): Promise<void> {
    await this.otpService.verifyOtp(email, purpose, otp);
  }
}
