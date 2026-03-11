import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { injectable, inject } from 'inversify';
import { StorageServicePort } from '../../application/ports/StorageServicePort';
import { UploadableFile } from '../../application/dto/shared/UploadableFile.dto';
import { StorageConfig } from '../../shared/config/types/StorageConfig';
import { TYPES } from '../../shared/di/types';

@injectable()
export class S3StorageService implements StorageServicePort {
  private readonly s3Client: S3Client;

  constructor(
    @inject(TYPES.StorageConfig)
    private readonly config: StorageConfig,
  ) {
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId:     config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async uploadFile(file: UploadableFile, folder: string): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    await this.s3Client.send(new PutObjectCommand({
      Bucket:      this.config.bucketName,
      Key:         fileName,
      Body:        file.buffer,
      ContentType: file.mimetype,
    }));

    return this.getPublicUrl(fileName);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const fileName = fileUrl.split('.com/')[1];

    await this.s3Client.send(new DeleteObjectCommand({
      Bucket: this.config.bucketName,
      Key:    fileName,
    }));
  }

  async getPresignedUploadUrl(
    s3Key:     string,
    mimeType:  string,
    expiresIn: number = 3600,
  ): Promise<string> {
    return getSignedUrl(
      this.s3Client,
      new PutObjectCommand({
        Bucket:      this.config.bucketName,
        Key:         s3Key,
        ContentType: mimeType,
      }),
      { expiresIn }
    );
  }

  getPublicUrl(s3Key: string): string {
    return `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${s3Key}`;
  }
  generateVideoKey(courseId: string, chapterId: string, filename: string): string {
  const sanitised = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `videos/${courseId}/${chapterId}/${Date.now()}-${sanitised}`;
}
}