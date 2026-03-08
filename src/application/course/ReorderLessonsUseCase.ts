import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import {
  ReorderLessonsRequestDTO,
  ReorderLessonsResponseDTO,
} from '../dto/course/Lesson.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';

@injectable()
export class ReorderLessonsUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: ReorderLessonsRequestDTO): Promise<ReorderLessonsResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    try {
      course.reorderLessons(dto.moduleId, dto.orderedIds);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
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