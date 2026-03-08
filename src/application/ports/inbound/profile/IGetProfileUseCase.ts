import { GetProfileRequestDTO, GetProfileResponseDTO } from '../../../dto/profile/GetProfile.dto';

export interface IGetProfileUseCase {
  execute(dto: GetProfileRequestDTO): Promise<GetProfileResponseDTO>;
}