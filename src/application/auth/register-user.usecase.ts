import { UserRepository } from "../../infrastructure/database/repositories/user.repository";
import { PasswordHasher } from "../../infrastructure/security/password-hasher";

interface RegisterUserInput{
    email: string;
    password: string;
    role: 'student'|'tutor'|'admin';
}

export class RegisterUserUseCase{
    constructor(private readonly userRepo: UserRepository) {}
    async execute(input: RegisterUserInput) {
        const existingUser = await this.userRepo.findByEmail(input.email);
        if(existingUser) {
            throw new Error ('Email already registered');
        }

        const passwordHash = await PasswordHasher.hash(input.password)

        await this.userRepo.create({
            email: input.email,
            passwordHash,
            role:input.role
        })

        return {
            email: input.email,
            role: input.role,
        }
    }
}