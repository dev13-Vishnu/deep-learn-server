import { UploadableFile } from '../shared/UploadableFile.dto';

export interface UploadAvatarRequestDTO {
  userId: string;
  file: UploadableFile;
}

export interface UploadAvatarResponseDTO {
  avatarUrl: string;
}