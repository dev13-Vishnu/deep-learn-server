import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import {
  RemoveLessonRequestDTO,
  RemoveLessonResponseDTO,
} from '../dto/course/Lesson.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';

@injectable()
export class RemoveLessonUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: RemoveLessonRequestDTO): Promise<RemoveLessonResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    if (course.enrollmentCount > 0) {
      throw new ApplicationError('COURSE_HAS_ENROLLMENTS', 'Cannot delete/remove a course with enrolled students');
    }

    try {
      course.removeLesson(dto.moduleId, dto.lessonId);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

    await this.courseRepository.update(course);

    return { message: 'Lesson removed successfully' };
  }
}