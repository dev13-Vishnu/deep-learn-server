import { PublicCourseDetailDTO } from './CourseData.dto';

export interface GetPublicCourseRequestDTO {
  courseId: string;
}

export interface GetPublicCourseResponseDTO {
  course: PublicCourseDetailDTO;
}