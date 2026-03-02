import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { DomainError } from '../../domain/errors/DomainError';
import {
  ReorderLessonsRequestDTO,
  ReorderLessonsResponseDTO,
} from '../dto/course/Lesson.dto';

@injectable()
export class ReorderLessonsUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: ReorderLessonsRequestDTO): Promise<ReorderLessonsResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    try {
      course.reorderLessons(dto.moduleId, dto.orderedIds);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    await this.courseRepository.update(course);

    const module = course.modules.find(m => m.id === dto.moduleId)!;

    return {
      message: 'Lessons reordered successfully',
      lessons: module.lessons.map(l => ({ id: l.id, order: l.order })),
    };
  }
}