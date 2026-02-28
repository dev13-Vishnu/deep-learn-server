import { UploadableFile } from '../dto/shared/UploadableFile.dto';

export interface StorageServicePort {
  uploadFile(file: UploadableFile, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}