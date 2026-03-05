import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { DomainError } from '../../domain/errors/DomainError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  UpdateLessonRequestDTO,
  UpdateLessonResponseDTO,
} from '../dto/course/Lesson.dto';

@injectable()
export class UpdateLessonUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: UpdateLessonRequestDTO): Promise<UpdateLessonResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    try {
      course.updateLesson(dto.moduleId, dto.lessonId, {
        title:       dto.title,
        description: dto.description,
        isPreview:   dto.isPreview,
      });
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    await this.courseRepository.update(course);

    const updatedModule = course.modules.find(m => m.id === dto.moduleId)!;
    const updatedLesson = updatedModule.lessons.find(l => l.id === dto.lessonId)!;

    return {
      message: 'Lesson updated successfully',
      lesson:  CourseMapper.toLessonDTO(updatedLesson),
    };
  }
}