
export interface UploadableFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}