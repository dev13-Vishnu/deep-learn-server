import { GetVideoUploadUrlRequestDTO, GetVideoUploadUrlResponseDTO } from '../../../dto/course/Video.dto';
export interface IGetVideoUploadUrlUseCase {
  execute(dto: GetVideoUploadUrlRequestDTO): Promise<GetVideoUploadUrlResponseDTO>;
}