import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import {
  ReorderModulesRequestDTO,
  ReorderModulesResponseDTO,
} from '../dto/course/Module.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';

@injectable()
export class ReorderModulesUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: ReorderModulesRequestDTO): Promise<ReorderModulesResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    try {
      course.reorderModules(dto.orderedIds);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

    await this.courseRepository.update(course);

    return {
      message: 'Modules reordered successfully',
      modules: course.modules.map(m => ({ id: m.id, order: m.order })),
    };
  }
}