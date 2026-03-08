import { GetCurrentUserRequestDTO, GetCurrentUserResponseDTO } from '../../../dto/auth/GetCurrentUser.dto';

export interface IGetCurrentUserUseCase {
  execute(dto: GetCurrentUserRequestDTO): Promise<GetCurrentUserResponseDTO>;
}