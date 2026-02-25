import { inject, injectable } from 'inversify';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { TYPES } from '../../shared/di/types';
import { AppError } from '../../shared/errors/AppError';
import {
  GetCurrentUserRequestDTO,
  GetCurrentUserResponseDTO,
} from '../dto/auth/GetCurrentUser.dto';


@injectable()
export class GetCurrentUserUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepo: UserRepositoryPort
  ) {}

  async execute(
    request: GetCurrentUserRequestDTO
  ): Promise<GetCurrentUserResponseDTO> {
    const user = await this.userRepo.findById(request.userId);

    if (!user) {
      throw new AppError('Authenticated user not found', 404);
    }

    if (!user.isActive) {
      throw new AppError('User account is inactive', 403);
    }

    if (!user.id) {
      throw new AppError('User ID not found', 500);
    }

    return {
      id: user.id,
      email: user.email.getValue(),
      role: user.role,
      instructorState: user.instructorState ?? null,
      profile: {
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        bio: user.bio ?? null,
        avatar: user.avatar ?? null,
      },
    };
  }
}