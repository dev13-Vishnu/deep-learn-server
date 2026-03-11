import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { StorageServicePort } from '../ports/StorageServicePort';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { DomainError } from '../../domain/errors/DomainError';
import {
  GetVideoUploadUrlRequestDTO,
  GetVideoUploadUrlResponseDTO,
} from '../dto/course/Video.dto';
import { IGetVideoUploadUrlUseCase } from '../ports/inbound/course/IGetVideoUploadUrlUseCase';

const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/mpeg',
];
const MAX_VIDEO_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB
const PRESIGNED_EXPIRES_IN = 3600;                    // 1 hour

@injectable()
export class GetVideoUploadUrlUseCase implements IGetVideoUploadUrlUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort,

    @inject(TYPES.StorageServicePort)
    private readonly storageService: StorageServicePort,
  ) {}

  async execute(dto: GetVideoUploadUrlRequestDTO): Promise<GetVideoUploadUrlResponseDTO> {
    // 1. Validate mime type + size before touching the DB
    if (!ALLOWED_VIDEO_MIME_TYPES.includes(dto.mimeType)) {
      throw new ApplicationError(
        'VALIDATION_ERROR',
        `Unsupported video format. Allowed: ${ALLOWED_VIDEO_MIME_TYPES.join(', ')}`,
      );
    }
    if (dto.size > MAX_VIDEO_SIZE_BYTES) {
      throw new ApplicationError('VALIDATION_ERROR', 'Video file cannot exceed 2 GB');
    }

    // 2. Load course (ownership verified via findByIdAndTutor)
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    // 3. Delegate key construction entirely to the storage port
    const s3Key = this.storageService.generateVideoKey(
      dto.courseId,
      dto.chapterId,
      dto.filename,
    );

    // 4. Attach video to chapter with status 'uploading'
    try {
      course.attachVideo(dto.moduleId, dto.lessonId, dto.chapterId, {
        s3Key,
        url:        this.storageService.getPublicUrl(s3Key),
        size:       dto.size,
        mimeType:   dto.mimeType,
        duration:   0,
        status:     'uploading',
        uploadedAt: new Date(),
      });
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

    // 5. Persist uploading state before issuing the URL
    await this.courseRepository.update(course);

    // 6. Generate presigned PUT URL
    const uploadUrl = await this.storageService.getPresignedUploadUrl(
      s3Key,
      dto.mimeType,
      PRESIGNED_EXPIRES_IN,
    );

    return { uploadUrl, s3Key, expiresIn: PRESIGNED_EXPIRES_IN };
  }
}