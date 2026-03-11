import { CourseBasicDTO } from './CourseData.dto';

export interface CreateCourseRequestDTO {
  tutorId:      string;
  title:        string;
  subtitle?:    string | null;
  description:  string;
  category:     'development' | 'design' | 'business' | 'marketing' | 'photography' | 'music' | 'health' | 'other';
  level:        'beginner' | 'intermediate' | 'advanced' | 'all';
  language:     string;
  price?:       number;
  currency?:    string;
  tags?:        string[];
}

export interface CreateCourseResponseDTO {
  message: string;
  course:  CourseBasicDTO;
}