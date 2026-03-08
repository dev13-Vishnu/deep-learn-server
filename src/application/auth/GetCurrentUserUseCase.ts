import { inject, injectable } from 'inversify';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { TYPES } from '../../shared/di/types';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { GetCurrentUserRequestDTO, GetCurrentUserResponseDTO } from '../dto/auth/GetCurrentUser.dto';

@injectable()
export class GetCurrentUserUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(request: GetCurrentUserRequestDTO): Promise<GetCurrentUserResponseDTO> {
    const user = await this.userRepo.findById(request.userId);

    if (!user) {
      throw new ApplicationError('USER_NOT_FOUND', 'Authenticated user not found');
    }
    if (!user.isActive) {
      throw new ApplicationError('ACCOUNT_INACTIVE', 'User account is inactive');
    }
    if (!user.id) {
      throw new ApplicationError('INTERNAL_ERROR', 'User ID not found');
    }

    return {
      id:              user.id,
      email:           user.email.getValue(),
      role:            user.role,
      instructorState: user.instructorState ?? null,
      profile: {
        firstName: user.firstName ?? null,
        lastName:  user.lastName  ?? null,
        bio:       user.bio       ?? null,
        avatar:    user.avatar    ?? null,
      },
    };
  }
}