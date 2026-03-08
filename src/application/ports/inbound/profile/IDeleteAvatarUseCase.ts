import { DeleteAvatarRequestDTO, DeleteAvatarResponseDTO } from '../../../dto/profile/DeleteAvatar.dto';

export interface IDeleteAvatarUseCase {
  execute(dto: DeleteAvatarRequestDTO): Promise<DeleteAvatarResponseDTO>;
}