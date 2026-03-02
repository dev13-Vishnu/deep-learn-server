import { UploadableFile } from '../shared/UploadableFile.dto';

export interface UploadThumbnailRequestDTO {
  courseId: string;
  tutorId:  string;
  file:     UploadableFile;
}

export interface UploadThumbnailResponseDTO {
  message:      string;
  thumbnailUrl: string;
}