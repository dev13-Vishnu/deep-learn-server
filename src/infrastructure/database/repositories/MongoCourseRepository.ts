import { injectable } from 'inversify';
import { Types } from 'mongoose';
import {
  CourseModel,
  ICourseDocument,
  IModuleDocument,
  ILessonDocument,
  IChapterDocument,
} from '../models/CourseModel';
import {
  CourseRepositoryPort,
  TutorCourseFilter,
} from '../../../application/ports/CourseRepositoryPort';
import {
  Course,
  Module,
  Lesson,
  Chapter,
  VideoMetadata,
  CourseStatus,
  CourseCategory,
  CourseLevel,
  ChapterType,
  VideoStatus,
} from '../../../domain/entities/Course';

@injectable()
export class MongoCourseRepository implements CourseRepositoryPort {

  // ─── Public interface ────────────────────────────────────────────────────────

  async create(course: Course): Promise<void> {
    await CourseModel.create(this.toPersistence(course));
  }

  async findById(id: string): Promise<Course | null> {
    const doc = await CourseModel.findById(id);
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByIdAndTutor(id: string, tutorId: string): Promise<Course | null> {
    const doc = await CourseModel.findOne({
      _id:     new Types.ObjectId(id),
      tutorId: new Types.ObjectId(tutorId),
    });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async update(course: Course): Promise<void> {
    await CourseModel.updateOne(
      { _id: course.id },
      { $set: this.toPersistence(course) }
    );
  }

  async delete(id: string): Promise<void> {
    await CourseModel.deleteOne({ _id: new Types.ObjectId(id) });
  }

  async findByTutor(
    tutorId: string,
    filter: TutorCourseFilter,
    skip: number,
    limit: number
  ): Promise<Course[]> {
    const query = this.buildTutorQuery(tutorId, filter);
    const docs  = await CourseModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return docs.map(doc => this.toDomain(doc));
  }

  async countByTutor(tutorId: string, filter: TutorCourseFilter): Promise<number> {
    const query = this.buildTutorQuery(tutorId, filter);
    return CourseModel.countDocuments(query);
  }

  // ─── Query builders ──────────────────────────────────────────────────────────

  private buildTutorQuery(
    tutorId: string,
    filter: TutorCourseFilter
  ): Record<string, unknown> {
    const query: Record<string, unknown> = {
      tutorId: new Types.ObjectId(tutorId),
    };
    if (filter.status !== undefined) {
      query.status = filter.status;
    }
    return query;
  }

  // ─── toDomain ────────────────────────────────────────────────────────────────

  private toDomain(doc: ICourseDocument): Course {
    return Course.reconstruct({
      id:              doc._id.toString(),
      tutorId:         doc.tutorId.toString(),
      title:           doc.title,
      subtitle:        doc.subtitle ?? null,
      description:     doc.description,
      thumbnail:       doc.thumbnail ?? null,
      category:        doc.category  as CourseCategory,
      level:           doc.level     as CourseLevel,
      language:        doc.language,
      price:           doc.price,
      currency:        doc.currency,
      tags:            doc.tags ?? [],
      status:          doc.status    as CourseStatus,
      totalDuration:   doc.totalDuration,
      enrollmentCount: doc.enrollmentCount,
      modules:         doc.modules.map(m => this.moduleFromDoc(m)),
      publishedAt:     doc.publishedAt ?? null,
      createdAt:       doc.createdAt,
      updatedAt:       doc.updatedAt,
    });
  }

  private moduleFromDoc(m: IModuleDocument): Module {
    return {
      id:          m.id,
      title:       m.title,
      description: m.description ?? null,
      order:       m.order,
      duration:    m.duration,
      lessons:     m.lessons.map(l => this.lessonFromDoc(l)),
    };
  }

  private lessonFromDoc(l: ILessonDocument): Lesson {
    return {
      id:          l.id,
      title:       l.title,
      description: l.description ?? null,
      order:       l.order,
      isPreview:   l.isPreview,
      duration:    l.duration,
      chapters:    l.chapters.map(c => this.chapterFromDoc(c)),
    };
  }

  private chapterFromDoc(c: IChapterDocument): Chapter {
    return {
      id:       c.id,
      title:    c.title,
      order:    c.order,
      type:     c.type      as ChapterType,
      duration: c.duration,
      isFree:   c.isFree,
      content:  c.content   ?? null,
      video:    c.video ? {
        s3Key:      c.video.s3Key,
        url:        c.video.url,
        size:       c.video.size,
        mimeType:   c.video.mimeType,
        duration:   c.video.duration,
        status:     c.video.status as VideoStatus,
        uploadedAt: c.video.uploadedAt,
      } : null,
    };
  }

  // ─── toPersistence ───────────────────────────────────────────────────────────

  private toPersistence(course: Course): Partial<ICourseDocument> {
    return {
      tutorId:         course.tutorId as unknown as Types.ObjectId,
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
      publishedAt:     course.publishedAt,
      modules:         course.modules.map(m => this.moduleToPersistence(m)),
    };
  }

  private moduleToPersistence(m: Module): IModuleDocument {
    return {
      id:          m.id,
      title:       m.title,
      description: m.description,
      order:       m.order,
      duration:    m.duration,
      lessons:     m.lessons.map(l => this.lessonToPersistence(l)),
    } as IModuleDocument;
  }

  private lessonToPersistence(l: Lesson): ILessonDocument {
    return {
      id:          l.id,
      title:       l.title,
      description: l.description,
      order:       l.order,
      isPreview:   l.isPreview,
      duration:    l.duration,
      chapters:    l.chapters.map(c => this.chapterToPersistence(c)),
    } as ILessonDocument;
  }

  private chapterToPersistence(c: Chapter): IChapterDocument {
    return {
      id:       c.id,
      title:    c.title,
      order:    c.order,
      type:     c.type,
      duration: c.duration,
      isFree:   c.isFree,
      content:  c.content,
      video:    c.video ?? null,
    } as IChapterDocument;
  }
}