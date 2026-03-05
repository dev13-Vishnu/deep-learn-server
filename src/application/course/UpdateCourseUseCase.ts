import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import { AppError } from '../../shared/errors/AppError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  UpdateCourseRequestDTO,
  UpdateCourseResponseDTO,
} from '../dto/course/UpdateCourse.dto';

@injectable()
export class UpdateCourseUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: UpdateCourseRequestDTO): Promise<UpdateCourseResponseDTO> {
        const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

        if (course.tutorId !== dto.tutorId) {
      throw new AppError('You do not have permission to update this course', 403);
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
        throw new AppError(error.message, 400);
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