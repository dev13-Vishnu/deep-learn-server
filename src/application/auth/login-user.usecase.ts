import { UserRepository } from "../../infrastructure/database/repositories/user.repository";
import { JwtService } from "../../infrastructure/security/jwt.services";
import { PasswordHasher } from "../../infrastructure/security/password-hasher";
import { AppError } from "../../shared/errors/AppError";

interface LoginUserInput {
    email: string;
    password: string;
}

export class LoginUserUseCase {
    constructor(private readonly userRepo: UserRepository) {}
    
    async execute ( input:  LoginUserInput) {
        const user= await this.userRepo.findByEmail(input.email);

        if(!user) {
            throw new AppError ('Invalid email or Password', 401);
        }

        const passwordMatch = await PasswordHasher.compare(
            input.password,
            user.passwordHash,
        );

        if(!passwordMatch) {
            throw new AppError ('invalid email or password', 401);
        }

        const accessToken = JwtService.sign({
            userId:user._id.toString(),
            role: user.role,
        })

        return {
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
            accessToken,
        };
    }
}