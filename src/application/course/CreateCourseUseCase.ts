import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { Course } from '../../domain/entities/Course';
import { DomainError } from '../../domain/errors/DomainError';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { CourseMapper } from '../mappers/CourseMapper';
import { CreateCourseRequestDTO, CreateCourseResponseDTO } from '../dto/course/CreateCourse.dto';
import { UserRole } from '../../domain/entities/UserRole';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { IdGeneratorPort } from '../ports/IdGeneratorPort';
import { ICreateCourseUseCase } from '../ports/inbound/course/ICreateCourseUseCase';

@injectable()
export class CreateCourseUseCase implements ICreateCourseUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort) private readonly courseRepository: CourseRepositoryPort,
    @inject(TYPES.UserRepositoryPort)   private readonly userRepository:   UserRepositoryPort,
    @inject(TYPES.IdGeneratorPort)      private readonly idGenerator:      IdGeneratorPort,
  ) {}

  async execute(dto: CreateCourseRequestDTO): Promise<CreateCourseResponseDTO> {
    const user = await this.userRepository.findById(dto.tutorId);
    if (!user) {
      throw new ApplicationError('USER_NOT_FOUND', 'User not found');
    }
    if (user.role !== UserRole.TUTOR) {
      throw new ApplicationError('FORBIDDEN', 'Only tutors can create courses');
    }

    let course: Course;
    try {
      course = Course.create({
        id: this.idGenerator.generate(),
        tutorId: dto.tutorId,
        title: dto.title,
        subtitle: dto.subtitle,
        description: dto.description,
        category: dto.category,
        level: dto.level,
        language: dto.language,
        price: dto.price,
        currency: dto.currency,
        tags: dto.tags,
      });
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

    await this.courseRepository.create(course);
    return { message: 'Course created successfully', course: CourseMapper.toBasicDTO(course) };
  }
}