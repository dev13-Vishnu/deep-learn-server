import { CourseBasicDTO } from './CourseData.dto';

export interface UpdateCourseRequestDTO {
  courseId: string;
  tutorId:  string;

  title?:       string;
  subtitle?:    string | null;
  description?: string;
  category?:    'development' | 'design' | 'business' | 'marketing' | 'photography' | 'music' | 'health' | 'other';
  level?:       'beginner' | 'intermediate' | 'advanced' | 'all';
  language?:    string;
  price?:       number;
  currency?:    string;
  tags?:        string[];
}

export interface UpdateCourseResponseDTO {
  message: string;
  course:  CourseBasicDTO;
}