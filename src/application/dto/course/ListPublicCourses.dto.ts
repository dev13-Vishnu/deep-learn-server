import { PublicCourseListItemDTO } from './CourseData.dto';
import { PublicCourseFilter } from '../../ports/CourseRepositoryPort';

export interface ListPublicCoursesRequestDTO {
  page?:    number;
  limit?:   number;
  filter:   PublicCourseFilter;
}

export interface ListPublicCoursesResponseDTO {
  courses:    PublicCourseListItemDTO[];
  pagination: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
  };
}