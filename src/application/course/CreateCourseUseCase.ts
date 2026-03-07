import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { Course } from '../../domain/entities/Course';
import { DomainError } from '../../domain/errors/DomainError';
import { AppError } from '../../shared/errors/AppError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  CreateCourseRequestDTO,
  CreateCourseResponseDTO,
} from '../dto/course/CreateCourse.dto';
import { UserRole } from '../../domain/entities/UserRole';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { IdGeneratorPort } from '../ports/IdGeneratorPort';

@injectable()
export class CreateCourseUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort,

    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,


    @inject(TYPES.IdGeneratorPort)
    private readonly idGenerator: IdGeneratorPort,
  ) {}

  async execute(dto: CreateCourseRequestDTO): Promise<CreateCourseResponseDTO> {
    // 1. Confirm the user exists and is a tutor
    const user = await this.userRepository.findById(dto.tutorId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (user.role !== UserRole.TUTOR) {
      throw new AppError('Only tutors can create courses', 403);
    }

    // 2. Build the domain entity — validation lives inside Course.create()
    let course: Course;
    try {
      course = Course.create({
        id: this.idGenerator.generate(),
        tutorId:     dto.tutorId,
        title:       dto.title,
        subtitle:    dto.subtitle,
        description: dto.description,
        category:    dto.category,
        level:       dto.level,
        language:    dto.language,
        price:       dto.price,
        currency:    dto.currency,
        tags:        dto.tags,
      });
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    // 3. Persist
    await this.courseRepository.create(course);

    // 4. Return response DTO via mapper — never return the domain entity
    return {
      message: 'Course created successfully',
      course:  CourseMapper.toBasicDTO(course),
    };
  }
}