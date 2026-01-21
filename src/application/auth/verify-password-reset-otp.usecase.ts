import { OtpServicePort } from "../ports/OtpServicePort";

export class VerifyPasswordResetOtpUseCase {
    constructor ( private readonly otpService: OtpServicePort){}

    async execute (email: string, otp: string): Promise<void> {

        await this.otpService.verifyOtp(email,otp, 'forgot-password',);
    }
}