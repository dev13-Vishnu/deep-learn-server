import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { DomainError } from '../../domain/errors/DomainError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  ConfirmVideoUploadRequestDTO,
  ConfirmVideoUploadResponseDTO,
} from '../dto/course/Video.dto';

@injectable()
export class ConfirmVideoUploadUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: ConfirmVideoUploadRequestDTO): Promise<ConfirmVideoUploadResponseDTO> {
    if (dto.duration <= 0) {
      throw new AppError('Video duration must be greater than 0', 400);
    }

    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // confirmVideo → sets status 'ready', stores duration, triggers recalculateDurations()
    try {
      course.confirmVideo(dto.moduleId, dto.lessonId, dto.chapterId, dto.duration);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    await this.courseRepository.update(course);

    const updatedModule  = course.modules.find(m => m.id === dto.moduleId)!;
    const updatedLesson  = updatedModule.lessons.find(l => l.id === dto.lessonId)!;
    const updatedChapter = updatedLesson.chapters.find(c => c.id === dto.chapterId)!;

    return {
      message: 'Video upload confirmed successfully',
      chapter: CourseMapper.toChapterDTO(updatedChapter),
    };
  }
}