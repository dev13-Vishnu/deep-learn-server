import { LoginUserRequestDTO, LoginUserResponseDTO } from '../../../dto/auth/LoginUser.dto';

export interface ILoginUserUseCase {
  execute(dto: LoginUserRequestDTO): Promise<LoginUserResponseDTO>;
}