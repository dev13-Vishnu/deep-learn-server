import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { UpdateProfileRequestDTO, UpdateProfileResponseDTO } from '../dto/profile/UpdateProfile.dto';
import { IUpdateProfileUseCase } from '../ports/inbound/profile/IUpdateProfileUseCase';

@injectable()
export class UpdateProfileUseCase implements IUpdateProfileUseCase {
  constructor(
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(request: UpdateProfileRequestDTO): Promise<UpdateProfileResponseDTO> {
    const user = await this.userRepository.findById(request.userId);
    if (!user)    { throw new ApplicationError('USER_NOT_FOUND',  'User not found'); }
    if (!user.id) { throw new ApplicationError('INTERNAL_ERROR', 'User ID not found'); }

    user.updateProfile(request.firstName, request.lastName, request.bio);
    await this.userRepository.update(user);

    return {
      id:        user.id,
      email:     user.email.getValue(),
      firstName: user.firstName,
      lastName:  user.lastName,
      avatarUrl: user.avatar,
      bio:       user.bio,
    };
  }
}