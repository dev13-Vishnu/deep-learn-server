import { CourseBasicDTO } from './CourseData.dto';


export interface UnpublishCourseRequestDTO {
  courseId: string;
  tutorId:  string;
}

export interface UnpublishCourseResponseDTO {
  message: string;
  course:  CourseBasicDTO;
}


export interface ArchiveCourseRequestDTO {
  courseId: string;
  tutorId:  string;
}

export interface ArchiveCourseResponseDTO {
  message: string;
  course:  CourseBasicDTO;
}