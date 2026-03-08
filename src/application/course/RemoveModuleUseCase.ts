import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import {
  RemoveModuleRequestDTO,
  RemoveModuleResponseDTO,
} from '../dto/course/Module.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';

@injectable()
export class RemoveModuleUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: RemoveModuleRequestDTO): Promise<RemoveModuleResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    if (course.enrollmentCount > 0) {
      throw new ApplicationError('COURSE_HAS_ENROLLMENTS', 'Cannot delete/remove a course with enrolled students');
    }

    try {
      course.removeModule(dto.moduleId);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

    await this.courseRepository.update(course);

    return { message: 'Module removed successfully' };
  }
}