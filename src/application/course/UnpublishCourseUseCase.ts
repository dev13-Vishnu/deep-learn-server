import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  UnpublishCourseRequestDTO,
  UnpublishCourseResponseDTO,
} from '../dto/course/UnpublishArchiveCourse.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { IUnpublishCourseUseCase } from '../ports/inbound/course/IUnpublishCourseUseCase';

@injectable()
export class UnpublishCourseUseCase implements IUnpublishCourseUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: UnpublishCourseRequestDTO): Promise<UnpublishCourseResponseDTO> {
    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    if (course.tutorId !== dto.tutorId) {
      throw new ApplicationError('FORBIDDEN', 'You do not have permission to unpublish this course');
    }

    try {
      course.unpublish();
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

    await this.courseRepository.update(course);

    return {
      message: 'Course unpublished successfully',
      course:  CourseMapper.toBasicDTO(course),
    };
  }
}