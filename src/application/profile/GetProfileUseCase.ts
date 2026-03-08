import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { UserReaderPort } from '../ports/UserReaderPort';
import { GetProfileRequestDTO, GetProfileResponseDTO } from '../dto/profile/GetProfile.dto';
import { IGetProfileUseCase } from '../ports/inbound/profile/IGetProfileUseCase';

@injectable()
export class GetProfileUseCase implements IGetProfileUseCase {
  constructor(
    @inject(TYPES.UserReaderPort)
    private readonly userReader: UserReaderPort,
  ) {}

  async execute(request: GetProfileRequestDTO): Promise<GetProfileResponseDTO> {
    const user = await this.userReader.findById(request.userId);
    if (!user)    { throw new ApplicationError('USER_NOT_FOUND',  'User not found'); }
    if (!user.id) { throw new ApplicationError('INTERNAL_ERROR', 'User ID not found'); }

    return {
      id:        user.id,
      email:     user.email.getValue(),
      firstName: user.firstName,
      lastName:  user.lastName,
      avatarUrl: user.avatar,
      bio:       user.bio,
      role:      user.role,
    };
  }
}