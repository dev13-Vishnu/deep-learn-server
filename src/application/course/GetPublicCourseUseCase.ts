import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  GetPublicCourseRequestDTO,
  GetPublicCourseResponseDTO,
} from '../dto/course/GetPublicCourse.dto';

@injectable()
export class GetPublicCourseUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: GetPublicCourseRequestDTO): Promise<GetPublicCourseResponseDTO> {
    const course = await this.courseRepository.findPublishedById(dto.courseId);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    return {
      course: CourseMapper.toPublicDetail(course),
    };
  }
}