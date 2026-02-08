import { inject, injectable } from "inversify";
import { OtpServicePort } from "../ports/OtpServicePort";
import { TYPES } from "../../shared/di/types";

@injectable()
export class RequestSignupOtpUseCase {
    constructor(
        @inject(TYPES.OtpServicePort)
        private readonly otpService: OtpServicePort
    ) {}

    async execute (email: string): Promise<Date> {
        return this.otpService.requestOtp(email,'signup');
    }
}