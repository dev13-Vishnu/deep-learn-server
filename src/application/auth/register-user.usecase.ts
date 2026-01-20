import { User } from "../../domain/entities/User";
import { UserRole } from "../../domain/entities/UserRole";
import { Email } from "../../domain/value-objects/Email";
import { Password } from "../../domain/value-objects/Password";
import { PasswordHasher } from "../../infrastructure/security/password-hasher";
import { AppError } from "../../shared/errors/AppError";
import { UserRepositoryPort } from "../ports/UserRepositoryPort";

interface RegisterUserInput{
    email: string;
    password: string;
}

export class RegisterUserUseCase{
    constructor(private readonly userRepo: UserRepositoryPort) {}
    async execute(input: RegisterUserInput): Promise<User> {
        const email = new Email(input.email);
        const password = new Password(input.password);

        const existingUser = await this.userRepo.findByEmail(email);
        if(existingUser) {
            throw new AppError ('User already exists', 409);
        }

        const passwordHash = await PasswordHasher.hash(password.getValue());

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