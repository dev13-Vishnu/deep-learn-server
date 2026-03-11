import { inject, injectable } from "inversify";
import { OtpServicePort } from "../ports/OtpServicePort";
import { TYPES } from "../../shared/di/types";
import { IRequestSignupOtpUseCase } from "../ports/inbound/auth/IRequestSignupOtpUseCase";

@injectable()
export class RequestSignupOtpUseCase implements IRequestSignupOtpUseCase {
    constructor(
        @inject(TYPES.OtpServicePort)
        private readonly otpService: OtpServicePort
    ) {}

    async execute (email: string): Promise<Date> {
        return this.otpService.requestOtp(email,'signup');
    }
}