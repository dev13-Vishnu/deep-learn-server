import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { DomainError } from '../../domain/errors/DomainError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  AddLessonRequestDTO,
  AddLessonResponseDTO,
} from '../dto/course/Lesson.dto';
import { IdGeneratorPort } from '../ports/IdGeneratorPort';

@injectable()
export class AddLessonUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort,

    @inject(TYPES.IdGeneratorPort)
    private readonly idGenerator: IdGeneratorPort,
  ) {}

  async execute(dto: AddLessonRequestDTO): Promise<AddLessonResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    let lesson;
    try {
      lesson = course.addLesson(dto.moduleId, {
        id: this.idGenerator.generate(),
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