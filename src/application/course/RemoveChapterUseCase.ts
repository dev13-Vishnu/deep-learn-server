import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import {
  RemoveChapterRequestDTO,
  RemoveChapterResponseDTO,
} from '../dto/course/Chapter.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';

@injectable()
export class RemoveChapterUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: RemoveChapterRequestDTO): Promise<RemoveChapterResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    if (course.enrollmentCount > 0) {
      throw new ApplicationError('COURSE_HAS_ENROLLMENTS', 'Cannot delete/remove a course with enrolled students');
    }

    try {
      course.removeChapter(dto.moduleId, dto.lessonId, dto.chapterId);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

    await this.courseRepository.update(course);

    return { message: 'Chapter removed successfully' };
  }
}