import { inject, injectable } from "inversify";
import { OtpServicePort } from "../ports/OtpServicePort";
import { TYPES } from "../../shared/di/types";
import { IVerifyPasswordResetOtpUseCase } from "../ports/inbound/auth/IVerifyPasswordResetOtpUseCase";

@injectable()
export class VerifyPasswordResetOtpUseCase implements IVerifyPasswordResetOtpUseCase {
    constructor ( 
        @inject(TYPES.OtpServicePort)
        private readonly otpService: OtpServicePort
    ){}

    async execute (email: string, otp: string): Promise<void> {

        await this.otpService.verifyOtp(email,otp, 'forgot-password',);
    }
}