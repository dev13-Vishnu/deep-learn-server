import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  GetTutorCourseRequestDTO,
  GetTutorCourseResponseDTO,
} from '../dto/course/GetTutorCourse.dto';

@injectable()
export class GetTutorCourseUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: GetTutorCourseRequestDTO): Promise<GetTutorCourseResponseDTO> {

    const course = await this.courseRepository.findByIdAndTutor(
      dto.courseId,
      dto.tutorId
    );

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    return {
      course: CourseMapper.toTutorDetail(course),
    };
  }
}