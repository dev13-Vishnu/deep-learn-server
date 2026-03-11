import { UploadAvatarRequestDTO, UploadAvatarResponseDTO } from '../../../dto/profile/UploadAvatar.dto';

export interface IUploadAvatarUseCase {
  execute(dto: UploadAvatarRequestDTO): Promise<UploadAvatarResponseDTO>;
}