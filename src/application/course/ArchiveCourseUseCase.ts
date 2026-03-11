import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  ArchiveCourseRequestDTO,
  ArchiveCourseResponseDTO,
} from '../dto/course/UnpublishArchiveCourse.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { IArchiveCourseUseCase } from '../ports/inbound/course/IArchiveCourseUseCase';

@injectable()
export class ArchiveCourseUseCase implements IArchiveCourseUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: ArchiveCourseRequestDTO): Promise<ArchiveCourseResponseDTO> {
    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    if (course.tutorId !== dto.tutorId) {
      throw new ApplicationError('FORBIDDEN', 'You do not have permission to archive this course');
    }

    try {
      course.archive();
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
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