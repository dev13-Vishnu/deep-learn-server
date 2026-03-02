import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { StorageServicePort } from '../ports/StorageServicePort';
import { AppError } from '../../shared/errors/AppError';
import { DomainError } from '../../domain/errors/DomainError';
import {
  GetVideoUploadUrlRequestDTO,
  GetVideoUploadUrlResponseDTO,
} from '../dto/course/Video.dto';

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
export class GetVideoUploadUrlUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort,

    @inject(TYPES.StorageServicePort)
    private readonly storageService: StorageServicePort
  ) {}

  async execute(dto: GetVideoUploadUrlRequestDTO): Promise<GetVideoUploadUrlResponseDTO> {
    // 1. Validate mime type + size before touching the DB
    if (!ALLOWED_VIDEO_MIME_TYPES.includes(dto.mimeType)) {
      throw new AppError(
        `Unsupported video format. Allowed: ${ALLOWED_VIDEO_MIME_TYPES.join(', ')}`,
        400
      );
    }
    if (dto.size > MAX_VIDEO_SIZE_BYTES) {
      throw new AppError('Video file cannot exceed 2 GB', 400);
    }

    // 2. Load course (ownership verified via findByIdAndTutor)
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // 3. Build organised S3 key
    //    Pattern: videos/{courseId}/{chapterId}/{timestamp}-{sanitisedFilename}
    const sanitisedFilename = dto.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const s3Key = `videos/${dto.courseId}/${dto.chapterId}/${Date.now()}-${sanitisedFilename}`;

    // 4. Attach video to chapter with status 'uploading' — records intent in DB
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
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    // 5. Persist uploading state before issuing the URL
    await this.courseRepository.update(course);

    // 6. Generate presigned PUT URL — client uploads directly to S3
    const uploadUrl = await this.storageService.getPresignedUploadUrl(
      s3Key,
      dto.mimeType,
      PRESIGNED_EXPIRES_IN
    );

    return { uploadUrl, s3Key, expiresIn: PRESIGNED_EXPIRES_IN };
  }
}