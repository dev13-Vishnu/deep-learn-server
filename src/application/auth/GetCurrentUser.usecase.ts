import { inject, injectable } from "inversify";
import { UserRepositoryPort } from "../ports/UserRepositoryPort";
import { TYPES } from "../../shared/di/types";

@injectable()
export class GetCurrentUserUseCase {
    constructor (
        @inject(TYPES.UserRepositoryPort)
        private readonly userRepo: UserRepositoryPort
    ) {}
    
    async execute(userId: string) {
        const user = await this.userRepo.findById(userId);

        if(!user){
            throw new Error ("Authenticated user not found");
        }

        if(!user.isActive) {
            throw new Error('User accound is inactive');
        }

        return {
            id: user.id,
            email: user.email.getValue(),
            role: user.role,
        };
    }
}