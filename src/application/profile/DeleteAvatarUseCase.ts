import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { StorageServicePort } from '../ports/StorageServicePort';
import { AppError } from '../../shared/errors/AppError';
import {
  DeleteAvatarRequestDTO,
  DeleteAvatarResponseDTO,
} from '../dto/profile/DeleteAvatar.dto';

@injectable()
export class DeleteAvatarUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @inject(TYPES.StorageServicePort)
    private readonly storageService: StorageServicePort
  ) {}

  async execute(request: DeleteAvatarRequestDTO): Promise<DeleteAvatarResponseDTO> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.avatar) {
      throw new AppError('No avatar to delete', 400);
    }

    await this.storageService.deleteFile(user.avatar);

    user.updateAvatar(null);

    await this.userRepository.update(user);

    return { message: 'Avatar deleted successfully' };
  }
}