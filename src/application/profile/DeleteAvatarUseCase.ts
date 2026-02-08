import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { StorageServicePort } from '../ports/StorageServicePort';
import { AppError } from '../../shared/errors/AppError';

@injectable()
export class DeleteAvatarUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @inject(TYPES.StorageServicePort)
    private readonly storageService: StorageServicePort
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.avatar) {
      throw new AppError('No avatar to delete', 400);
    }

    // Delete from cloud storage
    await this.storageService.deleteFile(user.avatar);

    // Update user entity
    user.updateAvatar(null);

    await this.userRepository.update(user);

    return { message: 'Avatar deleted successfully' };
  }
}