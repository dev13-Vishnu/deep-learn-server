import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { GetProfileUseCase } from '../../application/profile/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../application/profile/UpdateProfileUseCase';
import { UploadAvatarUseCase } from '../../application/profile/UploadAvatarUseCase';
import { DeleteAvatarUseCase } from '../../application/profile/DeleteAvatarUseCase';
import { AuthenticatedRequest } from '../../infrastructure/security/jwt-auth.middleware';

@injectable()
export class ProfileController {
  constructor(
    @inject(TYPES.GetProfileUseCase)
    private readonly getProfileUseCase: GetProfileUseCase,

    @inject(TYPES.UpdateProfileUseCase)
    private readonly updateProfileUseCase: UpdateProfileUseCase,

    @inject(TYPES.UploadAvatarUseCase)
    private readonly uploadAvatarUseCase: UploadAvatarUseCase,

    @inject(TYPES.DeleteAvatarUseCase)
    private readonly deleteAvatarUseCase: DeleteAvatarUseCase
  ) {}

  async getProfile(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;
    const profile = await this.getProfileUseCase.execute(authReq.user!.userId);
    return res.status(200).json(profile);
  }

  async updateProfile(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;
    const profile = await this.updateProfileUseCase.execute(
      authReq.user!.userId,
      req.body
    );
    return res.status(200).json(profile);
  }

  async uploadAvatar(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await this.uploadAvatarUseCase.execute(
      authReq.user!.userId,
      req.file
    );

    return res.status(200).json(result);
  }

  async deleteAvatar(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;
    const result = await this.deleteAvatarUseCase.execute(authReq.user!.userId);
    return res.status(200).json(result);
  }
}