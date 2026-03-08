import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  PublishCourseRequestDTO,
  PublishCourseResponseDTO,
} from '../dto/course/PublishCourse.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { IPublishCourseUseCase } from '../ports/inbound/course/IPublishCourseUseCase';

@injectable()
export class PublishCourseUseCase implements IPublishCourseUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: PublishCourseRequestDTO): Promise<PublishCourseResponseDTO> {
    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    if (course.tutorId !== dto.tutorId) {
      throw new ApplicationError('FORBIDDEN', 'You do not have permission to publish this course');
    }

    try {
      course.publish();
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

    await this.courseRepository.update(course);

    return {
      message: 'Course published successfully',
      course:  CourseMapper.toBasicDTO(course),
    };
  }
}