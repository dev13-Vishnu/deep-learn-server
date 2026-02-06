import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/di/types";
import { UpdateMyProfileUseCase } from "../../application/profile/UpdateMyProfile.usecase";
import { Request,Response } from "express";
import { AuthenticatedRequest } from "../../infrastructure/security/jwt-auth.middleware";

@injectable()
export class UserController{
    constructor(
        @inject(TYPES.UpdateMyProfileUseCase)
        private readonly updateMyprofileUseCase: UpdateMyProfileUseCase
    ){}

    async updateMyProfile(req:Request, res: Response) {
        const authReq = req as AuthenticatedRequest;

        await this.updateMyprofileUseCase.execute({
            userId: authReq.user!.userId,
            firstName: req.body.firsanme,
            lastName: req.body.lastName,
            bio: req.body.bio,
        });

        return res.status(201).send();
    }
}