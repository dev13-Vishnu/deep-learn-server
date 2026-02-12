import { inject, injectable } from "inversify";
import { UserRole } from "../../domain/entities/UserRole";
import { UserRepositoryPort } from "../ports/UserRepositoryPort";
import { TYPES } from "../../shared/di/types";
import { PasswordHasherPort } from "../ports/PasswordHasherPort";
import { TokenServicePort } from "../ports/TokenServicePort";
import { OtpServicePort } from "../ports/OtpServicePort";
import { CreateRefreshTokenUseCase } from "./CreateRefreshTokenUseCase";
import { Password } from "../../domain/value-objects/Password";
import { Email } from "../../domain/value-objects/Email";
import { AppError } from "../../shared/errors/AppError";
import { User } from "../../domain/entities/User";

interface SignupInput {
    email: string;
    password: string;
    otp: string;
    firstName?: string;
    lastName?: string;
}

interface SignupOutput {
    user: {
        id: string;
        email: string;
        role: UserRole;
    };
    accessToken: string;
    refreshToken: string;
}

@injectable()
export class SignupUseCase {
    constructor(
        @inject(TYPES.UserRepositoryPort)
        private readonly userRepo: UserRepositoryPort,

        @inject(TYPES.PasswordHasherPort)
        private readonly passwordHasher: PasswordHasherPort,

        @inject(TYPES.TokenServicePort)
        private readonly tokenService: TokenServicePort,

        @inject(TYPES.OtpServicePort)
        private readonly otpService: OtpServicePort,

        @inject(TYPES.CreateRefreshTokenUseCase)
        private readonly createRefreshTokenUseCase: CreateRefreshTokenUseCase,
    ) {}

    async execute (input: SignupInput): Promise<SignupOutput> {

        await this.otpService.verifyOtp(input.email, input.otp, 'signup');

        const email = new Email(input.email);
        const password = new Password(input.password);

        const existingUser = await this.userRepo.findByEmail(email);
        if (existingUser) {
            throw new AppError('User already exists', 409)
        }

        const passwordHash = await this.passwordHasher.hash(password.getValue());

        const user = new User(
            email,
            UserRole.STUDENT,
            passwordHash,
            true,
            true,
            undefined,
            input.firstName,
            input.lastName,
            null,
            null,
            'not_applied'
        );

        const savedUser = await this.userRepo.create(user);

        if(!savedUser.id) {
            throw new AppError('User registration failed', 500);
        }

        const accessToken = this.tokenService.generateAccessToken({
            userId: savedUser.id,
            role: savedUser.role,
        })

        const {token: refreshToken} = await this.createRefreshTokenUseCase.execute(savedUser.id);


        return {
            user: {
                id: savedUser.id ,
                email: savedUser.email.getValue() ,
                role: savedUser.role ,
            },
            accessToken,
            refreshToken,
        }
    }
}