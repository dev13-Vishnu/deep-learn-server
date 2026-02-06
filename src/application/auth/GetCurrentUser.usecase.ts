import { inject, injectable } from "inversify";
import { UserRepositoryPort } from "../ports/UserRepositoryPort";
import { TYPES } from "../../shared/di/types";
import { AppError } from "../../shared/errors/AppError";

@injectable()
export class GetCurrentUserUseCase {
    constructor (
        @inject(TYPES.UserRepositoryPort)
        private readonly userRepo: UserRepositoryPort
    ) {}
    
    async execute(userId: string) {
        const user = await this.userRepo.findById(userId);

        if(!user){
            throw new AppError ("Authenticated user not found",404);
        }

        if(!user.isActive) {
            throw new AppError('User accound is inactive',403);
        }

        return {
            id: user.id,
            email: user.email.getValue(),
            role: user.role,
            profile: {
                firstName: user.firstName ?? null,
                lastName: user.lastName ?? null,
                bio: user.bio ?? null,
                avatarUrl: user.avatarUrl ?? null,
            }
        };
    }
}