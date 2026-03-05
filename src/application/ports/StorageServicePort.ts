import { UploadableFile } from '../dto/shared/UploadableFile.dto';

export interface StorageServicePort {
  uploadFile(file: UploadableFile, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
  getPresignedUploadUrl(s3Key: string, mimeType: string, expiresIn?: number): Promise<string>;
  getPublicUrl(s3Key: string): string;
}