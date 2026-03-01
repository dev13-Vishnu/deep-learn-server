
export interface VideoMetadataDTO {
  s3Key:      string;
  url:        string;
  size:       number;
  mimeType:   string;
  duration:   number;
  status:     'uploading' | 'ready' | 'failed';
  uploadedAt: string; }

export interface ChapterDTO {
  id:       string;
  title:    string;
  order:    number;
  type:     'video' | 'text';
  duration: number;
  isFree:   boolean;
  content:  string | null;
  video:    VideoMetadataDTO | null;
}

export interface LessonDTO {
  id:          string;
  title:       string;
  description: string | null;
  order:       number;
  isPreview:   boolean;
  duration:    number;
  chapters:    ChapterDTO[];
}

export interface ModuleDTO {
  id:          string;
  title:       string;
  description: string | null;
  order:       number;
  duration:    number;
  lessons:     LessonDTO[];
}

export interface CourseBasicDTO {
  id:              string;
  tutorId:         string;
  title:           string;
  subtitle:        string | null;
  description:     string;
  thumbnail:       string | null;
  category:        string;
  level:           string;
  language:        string;
  price:           number;
  currency:        string;
  tags:            string[];
  status:          string;
  totalDuration:   number;
  enrollmentCount: number;
  publishedAt:     string | null;
  createdAt:       string;
  updatedAt:       string;
}

export interface CourseTutorDetailDTO extends CourseBasicDTO {
  modules: ModuleDTO[];
}

export interface TutorCourseListItemDTO {
  id:              string;
  title:           string;
  thumbnail:       string | null;
  status:          string;
  level:           string;
  category:        string;
  totalDuration:   number;
  enrollmentCount: number;
  updatedAt:       string;
  publishedAt:     string | null;
}