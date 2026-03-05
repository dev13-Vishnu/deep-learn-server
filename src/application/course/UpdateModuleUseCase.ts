import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { DomainError } from '../../domain/errors/DomainError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  UpdateModuleRequestDTO,
  UpdateModuleResponseDTO,
} from '../dto/course/Module.dto';

@injectable()
export class UpdateModuleUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: UpdateModuleRequestDTO): Promise<UpdateModuleResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    try {
      course.updateModule(dto.moduleId, {
        title:       dto.title,
        description: dto.description,
      });
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    await this.courseRepository.update(course);

    const updatedModule = course.modules.find(m => m.id === dto.moduleId)!;

    return {
      message: 'Module updated successfully',
      module:  CourseMapper.toModuleDTO(updatedModule),
    };
  }
}