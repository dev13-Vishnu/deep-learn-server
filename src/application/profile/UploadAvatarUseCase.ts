import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { StorageServicePort } from '../ports/StorageServicePort';
import { AppError } from '../../shared/errors/AppError';
import {
  UploadAvatarRequestDTO,
  UploadAvatarResponseDTO,
} from '../dto/profile/UploadAvatar.dto';

@injectable()
export class UploadAvatarUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @inject(TYPES.StorageServicePort)
    private readonly storageService: StorageServicePort
  ) {}

  async execute(request: UploadAvatarRequestDTO): Promise<UploadAvatarResponseDTO> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.avatar) {
      try {
        await this.storageService.deleteFile(user.avatar);
      } catch (err) {
        console.error('Failed to delete old avatar:', err);
      }
    }

    const avatarUrl = await this.storageService.uploadFile(request.file, 'avatars');

    user.updateAvatar(avatarUrl);

    await this.userRepository.update(user);

    return { avatarUrl };
  }
}