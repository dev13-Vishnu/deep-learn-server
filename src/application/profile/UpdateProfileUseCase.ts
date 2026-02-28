import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import {
  UpdateProfileRequestDTO,
  UpdateProfileResponseDTO,
} from '../dto/profile/UpdateProfile.dto';

@injectable()
export class UpdateProfileUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(
    request: UpdateProfileRequestDTO
  ): Promise<UpdateProfileResponseDTO> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.id) {
      throw new AppError('User ID not found', 500);
    }

    user.updateProfile(request.firstName, request.lastName, request.bio);
    await this.userRepository.update(user);

    return {
      id: user.id,
      email: user.email.getValue(),
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatar,
      bio: user.bio,
    };
  }
}