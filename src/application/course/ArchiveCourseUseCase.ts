import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { DomainError } from '../../domain/errors/DomainError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  ArchiveCourseRequestDTO,
  ArchiveCourseResponseDTO,
} from '../dto/course/UnpublishArchiveCourse.dto';

@injectable()
export class ArchiveCourseUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: ArchiveCourseRequestDTO): Promise<ArchiveCourseResponseDTO> {
    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.tutorId !== dto.tutorId) {
      throw new AppError('You do not have permission to archive this course', 403);
    }

    try {
      course.archive();
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new AppError(error.message, 422);
      }
      throw error;
    }

    await this.courseRepository.update(course);

    return {
      message: 'Course archived successfully',
      course:  CourseMapper.toBasicDTO(course),
    };
  }
}