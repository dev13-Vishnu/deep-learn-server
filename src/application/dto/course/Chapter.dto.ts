import { ChapterDTO } from './CourseData.dto';

// ─── Add Chapter 

export interface AddChapterRequestDTO {
  courseId:  string;
  tutorId:   string;
  moduleId:  string;
  lessonId:  string;
  title:     string;
  type:      'video' | 'text';
  isFree?:   boolean;
  content?:  string | null;
  duration?: number;
}

export interface AddChapterResponseDTO {
  message: string;
  chapter: ChapterDTO;
}

// ─── Update Chapter 

export interface UpdateChapterRequestDTO {
  courseId:  string;
  tutorId:   string;
  moduleId:  string;
  lessonId:  string;
  chapterId: string;
  title?:    string;
  isFree?:   boolean;
  content?:  string | null;
  duration?: number;
}

export interface UpdateChapterResponseDTO {
  message: string;
  chapter: ChapterDTO;
}

// ─── Remove Chapter 

export interface RemoveChapterRequestDTO {
  courseId:  string;
  tutorId:   string;
  moduleId:  string;
  lessonId:  string;
  chapterId: string;
}

export interface RemoveChapterResponseDTO {
  message: string;
}

// ─── Reorder Chapters 

export interface ReorderChaptersRequestDTO {
  courseId:   string;
  tutorId:    string;
  moduleId:   string;
  lessonId:   string;
  orderedIds: string[];
}

export interface ReorderChaptersResponseDTO {
  message:  string;
  chapters: { id: string; order: number }[];
}