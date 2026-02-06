import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/di/types";
import { UserRepositoryPort } from "../ports/UserRepositoryPort";
import { AppError } from "../../shared/errors/AppError";

interface UpdateMyProfileInput {
    userId: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
}

@injectable()
export class UpdateMyProfileUseCase {
    constructor (
        @inject(TYPES.UserRepositoryPort)
        private readonly userRepo: UserRepositoryPort
    ) {}

    async execute(input:UpdateMyProfileInput): Promise<void> {
        const user = await this.userRepo.findById(input.userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        user.updateProfile({
            firstName: input.firstName,
            lastName: input.lastName,
            bio: input.bio,
        });
        await this.userRepo.update(user);
    }
}