import { CourseTutorDetailDTO } from './CourseData.dto';

export interface GetTutorCourseRequestDTO {
  courseId: string;
  tutorId:  string;
}

export interface GetTutorCourseResponseDTO {
  course: CourseTutorDetailDTO;
}