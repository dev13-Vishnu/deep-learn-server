import { injectable, inject } from 'inversify';
import { HttpRequest, HttpResponse } from './HttpContext';
import { CourseController } from '../controllers/CourseController';

import { CourseCategory, CourseLevel, CourseStatus } from '../../domain/entities/Course';
import { PublicCourseSort } from '../../application/ports/CourseRepositoryPort';
import { PRESENTATION_TYPES } from '../di/presentationTypes';


@injectable()
export class CourseHttpAdapter {
  constructor(
    @inject(PRESENTATION_TYPES.CourseController)
    private readonly courseController: CourseController,
  ) {}

  async createCourse(req: HttpRequest, res: HttpResponse): Promise<void> {
    const body = req.body as {
      title: string;
      subtitle?: string | null;
      description: string;
      category: CourseCategory;
      level: CourseLevel;
      language: string;
      price?: number;
      currency?: string;
      tags?: string[];
    };
    const result = await this.courseController.createCourse(req.user!.userId, body);
    res.status(201).json(result);
  }

  async updateCourse(req: HttpRequest, res: HttpResponse): Promise<void> {
    const body = req.body as {
      title?: string;
      subtitle?: string | null;
      description?: string;
      category?: CourseCategory;
      level?: CourseLevel;
      language?: string;
      price?: number;
      currency?: string;
      tags?: string[];
    };
    const result = await this.courseController.updateCourse(
      req.params.courseId, req.user!.userId, body
    );
    res.status(200).json(result);
  }

  async getMyCourses(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { page, limit, status } = req.query;
    const result = await this.courseController.getMyCourses(req.user!.userId, {
      page:   page  ? parseInt(page,  10) : undefined,
      limit:  limit ? parseInt(limit, 10) : undefined,
      status: (status || undefined) as CourseStatus | undefined,
    });
    res.status(200).json(result);
  }

  async getMyCourse(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.courseController.getMyCourse(req.params.courseId, req.user!.userId);
    res.status(200).json(result);
  }

  // REPLACE getPublicCourses:
  async getPublicCourses(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { page, limit, category, level, language, minPrice, maxPrice, search, sort } = req.query;
    const result = await this.courseController.getPublicCourses({
      page:  page  ? parseInt(page,  10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      filter: {
        category: (category || undefined) as CourseCategory | undefined,
        level:    (level    || undefined) as CourseLevel    | undefined,
        language: language || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        search:   search   || undefined,
        sort:     (sort    || undefined) as PublicCourseSort | undefined,
      },
    });
    res.status(200).json(result);
  }

  async getPublicCourse(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.courseController.getPublicCourse(req.params.courseId);
    res.status(200).json(result);
  }

  async deleteCourse(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.courseController.deleteCourse(req.params.courseId, req.user!.userId);
    res.status(200).json(result);
  }

  async uploadThumbnail(req: HttpRequest, res: HttpResponse): Promise<void> {
    if (!req.file) { res.status(400).json({ message: 'No file uploaded' }); return; }
    const result = await this.courseController.uploadThumbnail(
      req.params.courseId, req.user!.userId, req.file
    );
    res.status(200).json(result);
  }

  async publishCourse(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.courseController.publishCourse(req.params.courseId, req.user!.userId);
    res.status(200).json(result);
  }

  async unpublishCourse(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.courseController.unpublishCourse(req.params.courseId, req.user!.userId);
    res.status(200).json(result);
  }

  async archiveCourse(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.courseController.archiveCourse(req.params.courseId, req.user!.userId);
    res.status(200).json(result);
  }

  async addModule(req: HttpRequest, res: HttpResponse): Promise<void> {
    const body = req.body as { title: string; description?: string | null };
    const result = await this.courseController.addModule(req.params.courseId, req.user!.userId, body);
    res.status(201).json(result);
  }

  async updateModule(req: HttpRequest, res: HttpResponse): Promise<void> {
    const body = req.body as { title?: string; description?: string | null };
    const result = await this.courseController.updateModule(
      req.params.courseId, req.user!.userId, req.params.moduleId, body
    );
    res.status(200).json(result);
  }

  async removeModule(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.courseController.removeModule(
      req.params.courseId, req.user!.userId, req.params.moduleId
    );
    res.status(200).json(result);
  }

  async reorderModules(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { orderedIds } = req.body as { orderedIds: string[] };
    const result = await this.courseController.reorderModules(
      req.params.courseId, req.user!.userId, orderedIds
    );
    res.status(200).json(result);
  }

  async addLesson(req: HttpRequest, res: HttpResponse): Promise<void> {
    const body = req.body as { title: string; description?: string | null; isPreview?: boolean };
    const result = await this.courseController.addLesson(
      req.params.courseId, req.user!.userId, req.params.moduleId, body
    );
    res.status(201).json(result);
  }

  async updateLesson(req: HttpRequest, res: HttpResponse): Promise<void> {
    const body = req.body as { title?: string; description?: string | null; isPreview?: boolean };
    const result = await this.courseController.updateLesson(
      req.params.courseId, req.user!.userId, req.params.moduleId, req.params.lessonId, body
    );
    res.status(200).json(result);
  }

  async removeLesson(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.courseController.removeLesson(
      req.params.courseId, req.user!.userId, req.params.moduleId, req.params.lessonId
    );
    res.status(200).json(result);
  }

  async reorderLessons(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { orderedIds } = req.body as { orderedIds: string[] };
    const result = await this.courseController.reorderLessons(
      req.params.courseId, req.user!.userId, req.params.moduleId, orderedIds
    );
    res.status(200).json(result);
  }

  async addChapter(req: HttpRequest, res: HttpResponse): Promise<void> {
    const body = req.body as { title: string; type: 'video' | 'text'; isFree?: boolean; content?: string | null; duration?: number };
    const result = await this.courseController.addChapter(
      req.params.courseId, req.user!.userId, req.params.moduleId, req.params.lessonId, body
    );
    res.status(201).json(result);
  }

  async updateChapter(req: HttpRequest, res: HttpResponse): Promise<void> {
    const body = req.body as { title?: string; isFree?: boolean; content?: string | null; duration?: number };
    const result = await this.courseController.updateChapter(
      req.params.courseId, req.user!.userId, req.params.moduleId, req.params.lessonId, req.params.chapterId, body
    );
    res.status(200).json(result);
  }

  async removeChapter(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.courseController.removeChapter(
      req.params.courseId, req.user!.userId, req.params.moduleId, req.params.lessonId, req.params.chapterId
    );
    res.status(200).json(result);
  }

  async reorderChapters(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { orderedIds } = req.body as { orderedIds: string[] };
    const result = await this.courseController.reorderChapters(
      req.params.courseId, req.user!.userId, req.params.moduleId, req.params.lessonId, orderedIds
    );
    res.status(200).json(result);
  }

  async getVideoUploadUrl(req: HttpRequest, res: HttpResponse): Promise<void> {
    const body = req.body as { filename: string; mimeType: string; size: number };
    const result = await this.courseController.getVideoUploadUrl(
      req.params.courseId, req.user!.userId, req.params.moduleId, req.params.lessonId, req.params.chapterId, body
    );
    res.status(200).json(result);
  }

  async confirmVideoUpload(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { duration } = req.body as { duration: number };
    const result = await this.courseController.confirmVideoUpload(
      req.params.courseId, req.user!.userId, req.params.moduleId, req.params.lessonId, req.params.chapterId, { duration }
    );
    res.status(200).json(result);
  }
}