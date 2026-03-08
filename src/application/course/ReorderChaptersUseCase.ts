import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import {
  ReorderChaptersRequestDTO,
  ReorderChaptersResponseDTO,
} from '../dto/course/Chapter.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';

@injectable()
export class ReorderChaptersUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: ReorderChaptersRequestDTO): Promise<ReorderChaptersResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    try {
      course.reorderChapters(dto.moduleId, dto.lessonId, dto.orderedIds);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

    await this.courseRepository.update(course);

    const module  = course.modules.find(m => m.id === dto.moduleId)!;
    const lesson  = module.lessons.find(l => l.id === dto.lessonId)!;

    return {
      message:  'Chapters reordered successfully',
      chapters: lesson.chapters.map(c => ({ id: c.id, order: c.order })),
    };
  }
}