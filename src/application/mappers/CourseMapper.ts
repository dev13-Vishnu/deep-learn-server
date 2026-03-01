import {
  Course,
  Module,
  Lesson,
  Chapter,
  VideoMetadata,
} from '../../domain/entities/Course';
import {
  CourseBasicDTO,
  CourseTutorDetailDTO,
  TutorCourseListItemDTO,
  ModuleDTO,
  LessonDTO,
  ChapterDTO,
  VideoMetadataDTO,
} from '../dto/course/CourseData.dto';

export class CourseMapper {

 
  static toBasicDTO(course: Course): CourseBasicDTO {
    return {
      id:              course.id,
      tutorId:         course.tutorId,
      title:           course.title,
      subtitle:        course.subtitle,
      description:     course.description,
      thumbnail:       course.thumbnail,
      category:        course.category,
      level:           course.level,
      language:        course.language,
      price:           course.price,
      currency:        course.currency,
      tags:            course.tags,
      status:          course.status,
      totalDuration:   course.totalDuration,
      enrollmentCount: course.enrollmentCount,
      publishedAt:     course.publishedAt?.toISOString() ?? null,
      createdAt:       course.createdAt.toISOString(),
      updatedAt:       course.updatedAt.toISOString(),
    };
  }

  static toTutorListItem(course: Course): TutorCourseListItemDTO {
    return {
      id:              course.id,
      title:           course.title,
      thumbnail:       course.thumbnail,
      status:          course.status,
      level:           course.level,
      category:        course.category,
      totalDuration:   course.totalDuration,
      enrollmentCount: course.enrollmentCount,
      updatedAt:       course.updatedAt.toISOString(),
      publishedAt:     course.publishedAt?.toISOString() ?? null,
    };
  }

  static toTutorDetail(course: Course): CourseTutorDetailDTO {
    return {
      ...CourseMapper.toBasicDTO(course),
      modules: course.modules.map(m => CourseMapper.toModuleDTO(m)),
    };
  }

 
  static toModuleDTO(module: Module): ModuleDTO {
    return {
      id:          module.id,
      title:       module.title,
      description: module.description,
      order:       module.order,
      duration:    module.duration,
      lessons:     module.lessons.map(l => CourseMapper.toLessonDTO(l)),
    };
  }

  static toLessonDTO(lesson: Lesson): LessonDTO {
    return {
      id:          lesson.id,
      title:       lesson.title,
      description: lesson.description,
      order:       lesson.order,
      isPreview:   lesson.isPreview,
      duration:    lesson.duration,
      chapters:    lesson.chapters.map(c => CourseMapper.toChapterDTO(c)),
    };
  }

  static toChapterDTO(chapter: Chapter): ChapterDTO {
    return {
      id:       chapter.id,
      title:    chapter.title,
      order:    chapter.order,
      type:     chapter.type,
      duration: chapter.duration,
      isFree:   chapter.isFree,
      content:  chapter.content,
      video:    chapter.video ? CourseMapper.toVideoMetadataDTO(chapter.video) : null,
    };
  }

  static toVideoMetadataDTO(video: VideoMetadata): VideoMetadataDTO {
    return {
      s3Key:      video.s3Key,
      url:        video.url,
      size:       video.size,
      mimeType:   video.mimeType,
      duration:   video.duration,
      status:     video.status,
      uploadedAt: video.uploadedAt.toISOString(),
    };
  }
}