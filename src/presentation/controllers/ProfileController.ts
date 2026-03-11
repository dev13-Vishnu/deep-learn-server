import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { IGetProfileUseCase }    from '../../application/ports/inbound/profile/IGetProfileUseCase';
import { IUpdateProfileUseCase } from '../../application/ports/inbound/profile/IUpdateProfileUseCase';
import { IUploadAvatarUseCase }  from '../../application/ports/inbound/profile/IUploadAvatarUseCase';
import { IDeleteAvatarUseCase }  from '../../application/ports/inbound/profile/IDeleteAvatarUseCase';
import { UploadableFile } from '../../application/dto/shared/UploadableFile.dto';

@injectable()
export class ProfileController {
  constructor(
    @inject(TYPES.GetProfileUseCase)
    private readonly getProfileUseCase: IGetProfileUseCase,

    @inject(TYPES.UpdateProfileUseCase)
    private readonly updateProfileUseCase: IUpdateProfileUseCase,

    @inject(TYPES.UploadAvatarUseCase)
    private readonly uploadAvatarUseCase: IUploadAvatarUseCase,

    @inject(TYPES.DeleteAvatarUseCase)
    private readonly deleteAvatarUseCase: IDeleteAvatarUseCase,
  ) {}

  async getProfile(userId: string) {
    return this.getProfileUseCase.execute({ userId });
  }

  async updateProfile(data: { userId: string; firstName?: string; lastName?: string; bio?: string }) {
    return this.updateProfileUseCase.execute(data);
  }

  async uploadAvatar(userId: string, file: UploadableFile) {
    return this.uploadAvatarUseCase.execute({ userId, file });
  }

  async deleteAvatar(userId: string) {
    return this.deleteAvatarUseCase.execute({ userId });
  }
}