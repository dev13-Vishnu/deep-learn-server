import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  UpdateCourseRequestDTO,
  UpdateCourseResponseDTO,
} from '../dto/course/UpdateCourse.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { IUpdateCourseUseCase } from '../ports/inbound/course/IUpdateCourseUseCase';

@injectable()
export class UpdateCourseUseCase implements IUpdateCourseUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: UpdateCourseRequestDTO): Promise<UpdateCourseResponseDTO> {
        const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

        if (course.tutorId !== dto.tutorId) {
      throw new ApplicationError('FORBIDDEN', 'You do not have permission to update this course');
    }

        try {
      course.updateBasicInfo({
        title:       dto.title,
        subtitle:    dto.subtitle,
        description: dto.description,
        category:    dto.category,
        level:       dto.level,
        language:    dto.language,
        price:       dto.price,
        currency:    dto.currency,
        tags:        dto.tags,
      });
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

        await this.courseRepository.update(course);

        return {
      message: 'Course updated successfully',
      course:  CourseMapper.toBasicDTO(course),
    };
  }
}