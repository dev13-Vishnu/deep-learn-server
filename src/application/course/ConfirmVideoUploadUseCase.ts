import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  ConfirmVideoUploadRequestDTO,
  ConfirmVideoUploadResponseDTO,
} from '../dto/course/Video.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';

@injectable()
export class ConfirmVideoUploadUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: ConfirmVideoUploadRequestDTO): Promise<ConfirmVideoUploadResponseDTO> {
    if (dto.duration <= 0) {
      throw new ApplicationError('VALIDATION_ERROR', 'Video duration must be greater than 0');
    }

    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    // confirmVideo → sets status 'ready', stores duration, triggers recalculateDurations()
    try {
      course.confirmVideo(dto.moduleId, dto.lessonId, dto.chapterId, dto.duration);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
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