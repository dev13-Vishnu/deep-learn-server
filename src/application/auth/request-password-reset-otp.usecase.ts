import { Email } from "../../domain/value-objects/Email";
import { OtpServicePort } from "../ports/OtpServicePort";
import { UserRepositoryPort } from "../ports/UserRepositoryPort";

export class RequestPasswordResetOtpUseCase {
    constructor (
        private readonly userRepo: UserRepositoryPort,
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