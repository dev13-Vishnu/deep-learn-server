import { LessonDTO } from './CourseData.dto';

// ─── Add Lesson──────────

export interface AddLessonRequestDTO {
  courseId:     string;
  tutorId:      string;
  moduleId:     string;
  title:        string;
  description?: string | null;
  isPreview?:   boolean;
}

export interface AddLessonResponseDTO {
  message: string;
  lesson:  LessonDTO;
}

// ─── Update Lesson───────

export interface UpdateLessonRequestDTO {
  courseId:     string;
  tutorId:      string;
  moduleId:     string;
  lessonId:     string;
  title?:       string;
  description?: string | null;
  isPreview?:   boolean;
}

export interface UpdateLessonResponseDTO {
  message: string;
  lesson:  LessonDTO;
}

// ─── Remove Lesson───────

export interface RemoveLessonRequestDTO {
  courseId: string;
  tutorId:  string;
  moduleId: string;
  lessonId: string;
}

export interface RemoveLessonResponseDTO {
  message: string;
}

// ─── Reorder Lessons─────

export interface ReorderLessonsRequestDTO {
  courseId:   string;
  tutorId:    string;
  moduleId:   string;
  orderedIds: string[];
}

export interface ReorderLessonsResponseDTO {
  message: string;
  lessons: { id: string; order: number }[];
}