import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  GetPublicCourseRequestDTO,
  GetPublicCourseResponseDTO,
} from '../dto/course/GetPublicCourse.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { IGetPublicCourseUseCase } from '../ports/inbound/course/IGetPublicCourseUseCase';

@injectable()
export class GetPublicCourseUseCase implements IGetPublicCourseUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: GetPublicCourseRequestDTO): Promise<GetPublicCourseResponseDTO> {
    const course = await this.courseRepository.findPublishedById(dto.courseId);

    if (!course) {
      throw new ApplicationError('COURSE_NOT_FOUND', 'Course not found');
    }

    return {
      course: CourseMapper.toPublicDetail(course),
    };
  }
}