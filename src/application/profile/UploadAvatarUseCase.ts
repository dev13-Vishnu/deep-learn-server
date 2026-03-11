import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { StorageServicePort } from '../ports/StorageServicePort';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { LoggerPort } from '../ports/LoggerPort';
import { UploadAvatarRequestDTO, UploadAvatarResponseDTO } from '../dto/profile/UploadAvatar.dto';
import { IUploadAvatarUseCase } from '../ports/inbound/profile/IUploadAvatarUseCase';

@injectable()
export class UploadAvatarUseCase implements IUploadAvatarUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @inject(TYPES.StorageServicePort)
    private readonly storageService: StorageServicePort,
    @inject(TYPES.LoggerPort)
    private readonly logger: LoggerPort,
  ) {}

  async execute(request: UploadAvatarRequestDTO): Promise<UploadAvatarResponseDTO> {
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new ApplicationError('USER_NOT_FOUND', 'User not found');
    }

    if (user.avatar) {
      try {
        await this.storageService.deleteFile(user.avatar);
      } catch (err) {
        this.logger.error('[UploadAvatarUseCase] Failed to delete old avatar', err);
      }
    }

    const avatarUrl = await this.storageService.uploadFile(request.file, 'avatars');
    user.updateAvatar(avatarUrl);
    await this.userRepository.update(user);

    return { avatarUrl };
  }
}