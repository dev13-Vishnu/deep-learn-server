import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { AppError } from '../../shared/errors/AppError';

interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  bio?: string;
}

@injectable()
export class UpdateProfileUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)  // ✅ Needs both read and write
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(userId: string, data: UpdateProfileDTO) {
    const user = await this.userRepository.findById(userId);  // Read

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Use the updateProfile method from User entity
    user.updateProfile(data.firstName, data.lastName, data.bio);
    await this.userRepository.update(user);  // Write

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