import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { AppError } from '../../shared/errors/AppError';
import { UserReaderPort } from '../ports/UserReaderPort';
import {
  GetProfileRequestDTO,
  GetProfileResponseDTO,
} from '../dto/profile/GetProfile.dto';

@injectable()
export class GetProfileUseCase {
  constructor(
    @inject(TYPES.UserReaderPort)
    private readonly userReader: UserReaderPort
  ) {}

  async execute(request: GetProfileRequestDTO): Promise<GetProfileResponseDTO> {
    const user = await this.userReader.findById(request.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.id) {
      throw new AppError('User ID not found', 500);
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