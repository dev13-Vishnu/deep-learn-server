import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { AppError } from '../../shared/errors/AppError';
import { UserReaderPort } from '../ports/UserReaderPort';

@injectable()
export class GetProfileUseCase {
  constructor(
    @inject(TYPES.UserReaderPort)  // Only inject what's needed
    private readonly userReader: UserReaderPort
  ) {}

  async execute(userId: string) {
    const user = await this.userReader.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      email: user.email.getValue(),
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatar,
      bio: user.bio,
      role: user.role,
    };
  }
}