import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { StorageServicePort } from '../ports/StorageServicePort';
import { AppError } from '../../shared/errors/AppError';

@injectable()
export class UploadAvatarUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @inject(TYPES.StorageServicePort)
    private readonly storageService: StorageServicePort
  ) {}

  async execute(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Delete old avatar if exists
    if (user.avatar) {
      try {
        await this.storageService.deleteFile(user.avatar);
      } catch (err) {
        // Ignore deletion errors
        console.error('Failed to delete old avatarUrl:', err);
      }
    }

    // Upload new avatar
    const avatarUrl = await this.storageService.uploadFile(file, 'avatars');

    // Use the updateAvatar method from User entity
    user.updateAvatar(avatarUrl);

    await this.userRepository.update(user);

    return {
      avatarUrl,
    };
  }
}