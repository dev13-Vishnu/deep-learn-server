import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { GetProfileUseCase } from '../../application/profile/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../application/profile/UpdateProfileUseCase';
import { UploadAvatarUseCase } from '../../application/profile/UploadAvatarUseCase';
import { DeleteAvatarUseCase } from '../../application/profile/DeleteAvatarUseCase';
import { AuthenticatedRequest } from '../../infrastructure/security/jwt-auth.middleware';
import { UploadableFile } from '../../application/dto/shared/UploadableFile.dto';

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
    const profile = await this.getProfileUseCase.execute({
      userId: authReq.user!.userId,
    });
    return res.status(200).json(profile);
  }

  async updateProfile(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;
    const profile = await this.updateProfileUseCase.execute({
      userId: authReq.user!.userId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      bio: req.body.bio,
    });
    return res.status(200).json(profile);
  }

  async uploadAvatar(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Map Express.Multer.File → UploadableFile (framework boundary)
    const uploadableFile: UploadableFile = {
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    };

    const result = await this.uploadAvatarUseCase.execute({
      userId: authReq.user!.userId,
      file: uploadableFile,
    });

    return res.status(200).json(result);
  }

  async deleteAvatar(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;
    const result = await this.deleteAvatarUseCase.execute({
      userId: authReq.user!.userId,
    });
    return res.status(200).json(result);
  }
}