import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { DomainError } from '../../domain/errors/DomainError';
import {
  RemoveLessonRequestDTO,
  RemoveLessonResponseDTO,
} from '../dto/course/Lesson.dto';

@injectable()
export class RemoveLessonUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: RemoveLessonRequestDTO): Promise<RemoveLessonResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.enrollmentCount > 0) {
      throw new AppError(
        'Cannot remove lessons from a course with enrolled students',
        409
      );
    }

    try {
      course.removeLesson(dto.moduleId, dto.lessonId);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    await this.courseRepository.update(course);

    return { message: 'Lesson removed successfully' };
  }
}