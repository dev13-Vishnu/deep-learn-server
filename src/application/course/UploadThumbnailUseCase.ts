import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { StorageServicePort } from '../ports/StorageServicePort';
import { DomainError } from '../../domain/errors/DomainError';
import { LoggerPort } from '../ports/LoggerPort';
import {
  UploadThumbnailRequestDTO,
  UploadThumbnailResponseDTO,
} from '../dto/course/UploadThumbnail.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';

@injectable()
export class UploadThumbnailUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort,

    @inject(TYPES.StorageServicePort)
    private readonly storageService: StorageServicePort,

    @inject(TYPES.LoggerPort)
    private readonly logger: LoggerPort,
  ) {}

  async execute(dto: UploadThumbnailRequestDTO): Promise<UploadThumbnailResponseDTO> {
    // 1. Load course
    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    // 2. Ownership check
    if (course.tutorId !== dto.tutorId) {
      throw new ApplicationError('FORBIDDEN', 'You do not have permission to update this course');
    }

    // 3. Delete old thumbnail from S3 if one exists
    if (course.thumbnail) {
      try {
        await this.storageService.deleteFile(course.thumbnail);
      } catch (error) {
        // Best-effort — log but don't block the upload
        this.logger.error('[UploadThumbnailUseCase] Failed to delete old thumbnail', error);
      }
    }

    // 4. Upload new thumbnail
    const thumbnailUrl = await this.storageService.uploadFile(dto.file, 'thumbnails');

    // 5. Update domain entity
    try {
      course.setThumbnail(thumbnailUrl);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

    // 6. Persist
    await this.courseRepository.update(course);

    return {
      message:      'Thumbnail uploaded successfully',
      thumbnailUrl,
    };
  }
}