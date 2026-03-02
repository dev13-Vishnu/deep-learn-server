import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { DomainError } from '../../domain/errors/DomainError';
import { generateId } from '../../shared/utils/idGenerator';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  AddLessonRequestDTO,
  AddLessonResponseDTO,
} from '../dto/course/Lesson.dto';

@injectable()
export class AddLessonUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: AddLessonRequestDTO): Promise<AddLessonResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    let lesson;
    try {
      lesson = course.addLesson(dto.moduleId, {
        id:          generateId(),
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

    return {
      message: 'Lesson added successfully',
      lesson:  CourseMapper.toLessonDTO(lesson),
    };
  }
}