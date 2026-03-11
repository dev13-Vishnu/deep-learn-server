import { ConfirmVideoUploadRequestDTO, ConfirmVideoUploadResponseDTO } from '../../../dto/course/Video.dto';
export interface IConfirmVideoUploadUseCase {
  execute(dto: ConfirmVideoUploadRequestDTO): Promise<ConfirmVideoUploadResponseDTO>;
}