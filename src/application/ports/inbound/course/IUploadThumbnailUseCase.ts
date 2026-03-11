import { UploadThumbnailRequestDTO, UploadThumbnailResponseDTO } from '../../../dto/course/UploadThumbnail.dto';
export interface IUploadThumbnailUseCase {
  execute(dto: UploadThumbnailRequestDTO): Promise<UploadThumbnailResponseDTO>;
}