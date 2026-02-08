import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/di/types";

import { User } from "../../domain/entities/User";
import { UserRole } from "../../domain/entities/UserRole";
import { Email } from "../../domain/value-objects/Email";
import { Password } from "../../domain/value-objects/Password";
import { AppError } from "../../shared/errors/AppError";
import { UserRepositoryPort } from "../ports/UserRepositoryPort";
import { PasswordHasherPort } from "../ports/PasswordHasherPort";



interface RegisterUserInput{
    email: string;
    password: string;
}
@injectable()
export class RegisterUserUseCase{
    constructor(
        @inject(TYPES.UserRepositoryPort)
        private readonly userRepo: UserRepositoryPort,

        @inject(TYPES.PasswordHasherPort)
        private readonly passwordHasher: PasswordHasherPort
    ) {}
    async execute(input: RegisterUserInput): Promise<User> {
        const email = new Email(input.email);
        const password = new Password(input.password);

        const existingUser = await this.userRepo.findByEmail(email);
        if(existingUser) {
            throw new AppError ('User already exists', 409);
        }

        const passwordHash =await this.passwordHasher.hash(password.getValue());

        const user = new User(
            email,
            UserRole.STUDENT,
            passwordHash,
            true,
            true,
        );
        return this.userRepo.create(user);
    }
}