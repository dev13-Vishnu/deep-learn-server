import { UpdateProfileRequestDTO, UpdateProfileResponseDTO } from '../../../dto/profile/UpdateProfile.dto';

export interface IUpdateProfileUseCase {
  execute(dto: UpdateProfileRequestDTO): Promise<UpdateProfileResponseDTO>;
}