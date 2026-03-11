import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { CourseRepositoryPort } from '../ports/CourseRepositoryPort';
import { CourseMapper } from '../mappers/CourseMapper';
import {
  ListPublicCoursesRequestDTO,
  ListPublicCoursesResponseDTO,
} from '../dto/course/ListPublicCourses.dto';
import { IListPublicCoursesUseCase } from '../ports/inbound/course/IListPublicCoursesUseCase';

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT     = 50;

@injectable()
export class ListPublicCoursesUseCase implements IListPublicCoursesUseCase {
  constructor(
    @inject(TYPES.CourseRepositoryPort)
    private readonly courseRepository: CourseRepositoryPort
  ) {}

  async execute(dto: ListPublicCoursesRequestDTO): Promise<ListPublicCoursesResponseDTO> {
    const page  = Math.max(1, dto.page  ?? DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, dto.limit ?? DEFAULT_LIMIT));
    const skip  = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      this.courseRepository.findPublished(dto.filter, skip, limit),
      this.courseRepository.countPublished(dto.filter),
    ]);

    return {
      courses:    courses.map(c => CourseMapper.toPublicListItem(c)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}