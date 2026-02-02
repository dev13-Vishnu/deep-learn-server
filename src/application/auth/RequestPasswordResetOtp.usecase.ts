import { inject, injectable } from "inversify";
import { Email } from "../../domain/value-objects/Email";
import { OtpServicePort } from "../ports/OtpServicePort";
import { UserRepositoryPort } from "../ports/UserRepositoryPort";
import { TYPES } from "../../shared/di/types";

@injectable()
export class RequestPasswordResetOtpUseCase {
    constructor (
        @inject(TYPES.UserRepositoryPort)
        private readonly userRepo: UserRepositoryPort,

        @inject(TYPES.OtpServicePort)
        private readonly otpService: OtpServicePort
    ) {}

    async execute(emailRaw:string):Promise<void> {
        const email = new Email(emailRaw);

        const user = await this.userRepo.findByEmail(email);

        if(!user){
            return;
        }
        await this.otpService.requestOtp(email.getValue(), "forgot-password");

    }
}