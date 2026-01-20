import { OtpServicePort, OtpPurpose } from '../../application/ports/OtpServicePort';
import { OTPService } from '../../services/otp.service';

export class OtpServiceAdapter implements OtpServicePort {

    constructor(  private readonly otpService :  OTPService) {}
   requestOtp(email: string, purpose: OtpPurpose): Promise<Date> {
    return this.otpService.sendOtp(email, purpose);
  }

   verifyOtp(email: string, otp: string, purpose: OtpPurpose): Promise<void> {
    return this.otpService.verifyOtp(email, purpose, otp);
  }
}
