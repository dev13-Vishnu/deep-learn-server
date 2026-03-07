import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { DomainError } from '../../domain/errors/DomainError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  AddModuleRequestDTO,
  AddModuleResponseDTO,
} from '../dto/course/Module.dto';
import { IdGeneratorPort } from '../ports/IdGeneratorPort';

@injectable()
export class AddModuleUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort,

    @inject(TYPES.IdGeneratorPort)
    private readonly idGenerator: IdGeneratorPort,
  ) {}

  async execute(dto: AddModuleRequestDTO): Promise<AddModuleResponseDTO> {
    const course = await this.courseRepository.findByIdAndTutor(dto.courseId, dto.tutorId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    let module;
    try {
      module = course.addModule({
        id: this.idGenerator.generate(),
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

    return {
      message: 'Module added successfully',
      module:  CourseMapper.toModuleDTO(module),
      course:  { totalDuration: course.totalDuration },
    };
  }
}