import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  UpdateChapterRequestDTO,
  UpdateChapterResponseDTO,
} from '../dto/course/Chapter.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { IUpdateChapterUseCase } from '../ports/inbound/course/IUpdateChapterUseCase';

@injectable()
export class UpdateChapterUseCase implements IUpdateChapterUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: UpdateChapterRequestDTO): Promise<UpdateChapterResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    try {
      course.updateChapter(dto.moduleId, dto.lessonId, dto.chapterId, {
        title:    dto.title,
        isFree:   dto.isFree,
        content:  dto.content,
        duration: dto.duration,
      });
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
      message: 'Chapter updated successfully',
      chapter: CourseMapper.toChapterDTO(updatedChapter),
    };
  }
}