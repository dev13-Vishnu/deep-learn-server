import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { injectable } from 'inversify';
import { storageConfig } from '../../shared/config/storage.config';

@injectable()
export class S3StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: storageConfig.aws.region,
      credentials: {
        accessKeyId: storageConfig.aws.accessKeyId,
        secretAccessKey: storageConfig.aws.secretAccessKey,
      },
    });
    this.bucketName = storageConfig.aws.bucketName;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string
  ): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read',
    });

    await this.s3Client.send(command);

    return `https://${this.bucketName}.s3.${storageConfig.aws.region}.amazonaws.com/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const fileName = fileUrl.split('.com/')[1];

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    await this.s3Client.send(command);
  }

  async getSignedUploadUrl(fileName: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}