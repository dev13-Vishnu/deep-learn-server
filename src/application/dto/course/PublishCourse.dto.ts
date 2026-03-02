import { CourseBasicDTO } from './CourseData.dto';

export interface PublishCourseRequestDTO {
  courseId: string;
  tutorId:  string;
}

export interface PublishCourseResponseDTO {
  message: string;
  course:  CourseBasicDTO;
}