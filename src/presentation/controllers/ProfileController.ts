import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { GetProfileUseCase } from '../../application/profile/GetProfileUseCase';
import { UpdateProfileUseCase } from '../../application/profile/UpdateProfileUseCase';
import { UploadAvatarUseCase } from '../../application/profile/UploadAvatarUseCase';
import { DeleteAvatarUseCase } from '../../application/profile/DeleteAvatarUseCase';
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
    private readonly deleteAvatarUseCase: DeleteAvatarUseCase,
  ) {}

  async getProfile(userId: string) {
    return this.getProfileUseCase.execute({ userId });
  }

  async updateProfile(data: {
    userId: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
  }) {
    return this.updateProfileUseCase.execute(data);
  }

  async uploadAvatar(userId: string, file: UploadableFile) {
    return this.uploadAvatarUseCase.execute({ userId, file });
  }

  async deleteAvatar(userId: string) {
    return this.deleteAvatarUseCase.execute({ userId });
  }
}