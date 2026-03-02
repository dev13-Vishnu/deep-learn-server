import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { DomainError } from '../../domain/errors/DomainError';
import { generateId } from '../../shared/utils/idGenerator';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  AddChapterRequestDTO,
  AddChapterResponseDTO,
} from '../dto/course/Chapter.dto';

@injectable()
export class AddChapterUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: AddChapterRequestDTO): Promise<AddChapterResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    let chapter;
    try {
      chapter = course.addChapter(dto.moduleId, dto.lessonId, {
        id:       generateId(),
        title:    dto.title,
        type:     dto.type,
        isFree:   dto.isFree,
        content:  dto.content,
        duration: dto.duration,
      });
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    await this.courseRepository.update(course);

    return {
      message: 'Chapter added successfully',
      chapter: CourseMapper.toChapterDTO(chapter),
    };
  }
}