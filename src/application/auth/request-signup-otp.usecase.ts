import { OtpServicePort } from "../ports/OtpServicePort";

export class RequestSignupOtpUseCase {
    constructor(
        private readonly otpService: OtpServicePort
    ) {}

    async execute (email: string): Promise<Date> {
        return this.otpService.requestOtp(email,'signup');
    }
}