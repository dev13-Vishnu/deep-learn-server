import { ChapterDTO } from './CourseData.dto';

// Get Video Upload URL

export interface GetVideoUploadUrlRequestDTO {
  courseId:  string;
  tutorId:   string;
  moduleId:  string;
  lessonId:  string;
  chapterId: string;
  filename:  string;
  mimeType:  string;
  size:      number;
}

export interface GetVideoUploadUrlResponseDTO {
  uploadUrl:  string;  // presigned S3 PUT URL — client uploads directly here
  s3Key:      string;  // stored on chapter; used to confirm later
  expiresIn:  number;  // seconds until presigned URL expires
}

// Confirm Video Upload

export interface ConfirmVideoUploadRequestDTO {
  courseId:  string;
  tutorId:   string;
  moduleId:  string;
  lessonId:  string;
  chapterId: string;
  duration:  number;  // seconds, read from <video> loadedmetadata on the client
}

export interface ConfirmVideoUploadResponseDTO {
  message: string;
  chapter: ChapterDTO;
}