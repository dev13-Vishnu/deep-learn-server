import { injectable, inject } from 'inversify';
import { HttpRequest, HttpResponse } from './HttpContext';
import { TYPES } from '../../shared/di/types';
import { ProfileController } from '../controllers/ProfileController';

@injectable()
export class ProfileHttpAdapter {
  constructor(
    @inject(TYPES.ProfileController)
    private readonly profileController: ProfileController,
  ) {}

  async getProfile(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.profileController.getProfile(req.user!.userId);
    res.status(200).json(result);
  }

  async updateProfile(req: HttpRequest, res: HttpResponse): Promise<void> {
    const body = req.body as { firstName?: string; lastName?: string; bio?: string };
    const result = await this.profileController.updateProfile({
      userId:    req.user!.userId,
      firstName: body.firstName,
      lastName:  body.lastName,
      bio:       body.bio,
    });
    res.status(200).json(result);
  }

  async uploadAvatar(req: HttpRequest, res: HttpResponse): Promise<void> {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const result = await this.profileController.uploadAvatar(req.user!.userId, req.file);
    res.status(200).json(result);
  }

  async deleteAvatar(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.profileController.deleteAvatar(req.user!.userId);
    res.status(200).json(result);
  }
}