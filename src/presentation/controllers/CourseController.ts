import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { AuthenticatedRequest } from '../../infrastructure/security/jwt-auth.middleware';
import { CreateCourseUseCase } from '../../application/course/CreateCourseUseCase';
import { UpdateCourseUseCase } from '../../application/course/UpdateCourseUseCase';
import { ListTutorCoursesUseCase } from '../../application/course/ListTutorCoursesUseCase';
import { CourseStatus } from '../../domain/entities/Course';
import { GetTutorCourseUseCase } from '../../application/course/GetTutorCourseUseCase';
import { DeleteCourseUseCase } from '../../application/course/DeleteCourseUseCase';
import { UploadableFile } from '../../application/dto/shared/UploadableFile.dto';
import { UploadThumbnailUseCase } from '../../application/course/UploadThumbnailUseCase';
import { PublishCourseUseCase } from '../../application/course/PublishCourseUseCase';
import { UnpublishCourseUseCase } from '../../application/course/UnpublishCourseUseCase';
import { ArchiveCourseUseCase } from '../../application/course/ArchiveCourseUseCase';
import { AddModuleUseCase } from '../../application/course/AddModuleUseCase';
import { UpdateModuleUseCase } from '../../application/course/UpdateModuleUseCase';
import { RemoveModuleUseCase } from '../../application/course/RemoveModuleUseCase';
import { ReorderModulesUseCase } from '../../application/course/ReorderModulesUseCase';
import { AddLessonUseCase } from '../../application/course/AddLessonUseCase';
import { UpdateLessonUseCase } from '../../application/course/UpdateLessonUseCase';
import { RemoveLessonUseCase } from '../../application/course/RemoveLessonUseCase';
import { ReorderLessonsUseCase } from '../../application/course/ReorderLessonsUseCase';
import { AddChapterUseCase } from '../../application/course/AddChapterUseCase';
import { UpdateChapterUseCase } from '../../application/course/UpdateChapterUseCase';
import { RemoveChapterUseCase } from '../../application/course/RemoveChapterUseCase';
import { ReorderChaptersUseCase } from '../../application/course/ReorderChaptersUseCase';
import { GetVideoUploadUrlUseCase } from '../../application/course/GetVideoUploadUrlUseCase';
import { ConfirmVideoUploadUseCase } from '../../application/course/ConfirmVideoUploadUseCase';
import { ListPublicCoursesUseCase } from '../../application/course/ListPublicCoursesUseCase';
import { PublicCourseSort } from '../../application/ports/CourseRepositoryPort';

@injectable()
export class CourseController {
  constructor(
    @inject(TYPES.CreateCourseUseCase)
    private readonly createCourseUseCase: CreateCourseUseCase,

    @inject(TYPES.UpdateCourseUseCase)
    private readonly updateCourseUseCase: UpdateCourseUseCase,

    @inject(TYPES.ListTutorCoursesUseCase)
    private readonly listTutorCoursesUseCase: ListTutorCoursesUseCase,

    @inject(TYPES.GetTutorCourseUseCase)
    private readonly getTutorCourseUseCase: GetTutorCourseUseCase,

    @inject(TYPES.DeleteCourseUseCase)
    private readonly deleteCourseUseCase: DeleteCourseUseCase,

    @inject(TYPES.UploadThumbnailUseCase)
    private readonly uploadThumbnailUseCase: UploadThumbnailUseCase,

    @inject(TYPES.PublishCourseUseCase)
    private readonly publishCourseUseCase: PublishCourseUseCase,

    @inject(TYPES.UnpublishCourseUseCase)
    private readonly unpublishCourseUseCase: UnpublishCourseUseCase,

    @inject(TYPES.ArchiveCourseUseCase)
    private readonly archiveCourseUseCase: ArchiveCourseUseCase,

    @inject(TYPES.AddModuleUseCase)
    private readonly addModuleUseCase: AddModuleUseCase,

    @inject(TYPES.UpdateModuleUseCase)
    private readonly updateModuleUseCase: UpdateModuleUseCase,

    @inject(TYPES.RemoveModuleUseCase)
    private readonly removeModuleUseCase: RemoveModuleUseCase,

    @inject(TYPES.ReorderModulesUseCase)
    private readonly reorderModulesUseCase: ReorderModulesUseCase,

    @inject(TYPES.AddLessonUseCase)
    private readonly addLessonUseCase: AddLessonUseCase,

    @inject(TYPES.UpdateLessonUseCase)
    private readonly updateLessonUseCase: UpdateLessonUseCase,

    @inject(TYPES.RemoveLessonUseCase)
    private readonly removeLessonUseCase: RemoveLessonUseCase,

    @inject(TYPES.ReorderLessonsUseCase)
    private readonly reorderLessonsUseCase: ReorderLessonsUseCase,

    //  Feature 11
    @inject(TYPES.AddChapterUseCase)
    private readonly addChapterUseCase: AddChapterUseCase,

    @inject(TYPES.UpdateChapterUseCase)
    private readonly updateChapterUseCase: UpdateChapterUseCase,

    @inject(TYPES.RemoveChapterUseCase)
    private readonly removeChapterUseCase: RemoveChapterUseCase,

    @inject(TYPES.ReorderChaptersUseCase)
    private readonly reorderChaptersUseCase: ReorderChaptersUseCase,

    @inject(TYPES.GetVideoUploadUrlUseCase)
    private readonly getVideoUploadUrlUseCase: GetVideoUploadUrlUseCase,

    @inject(TYPES.ConfirmVideoUploadUseCase)
    private readonly confirmVideoUploadUseCase: ConfirmVideoUploadUseCase,

    @inject(TYPES.ListPublicCoursesUseCase)
    private readonly listPublicCoursesUseCase: ListPublicCoursesUseCase,
  ) {}

  async createCourse(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.createCourseUseCase.execute({
      tutorId:     authReq.user!.userId,
      title:       req.body.title,
      subtitle:    req.body.subtitle    ?? null,
      description: req.body.description,
      category:    req.body.category,
      level:       req.body.level,
      language:    req.body.language,
      price:       req.body.price,
      currency:    req.body.currency,
      tags:        req.body.tags,
    });

    return res.status(201).json(result);
  }

  async updateCourse(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.updateCourseUseCase.execute({
      courseId:    req.params.courseId,
      tutorId:     authReq.user!.userId,
      title:       req.body.title,
      subtitle:    req.body.subtitle,
      description: req.body.description,
      category:    req.body.category,
      level:       req.body.level,
      language:    req.body.language,
      price:       req.body.price,
      currency:    req.body.currency,
      tags:        req.body.tags,
    });

    return res.status(200).json(result);
  }

  async getMyCourses(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;
    const { page, limit, status } = req.query;

    const result = await this.listTutorCoursesUseCase.execute({
      tutorId: authReq.user!.userId,
      page:    page  ? parseInt(page  as string, 10) : undefined,
      limit:   limit ? parseInt(limit as string, 10) : undefined,
      status:  status as CourseStatus | undefined,
    });

    return res.status(200).json(result);
  }

  async getMyCourse(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.getTutorCourseUseCase.execute({
      courseId: req.params.courseId,
      tutorId:  authReq.user!.userId,
    });

    return res.status(200).json(result);
  }

  async getPublicCourses(req: Request, res: Response): Promise<Response> {
    const {
      page, limit,
      category, level, language,
      minPrice, maxPrice,
      search, sort,
    } = req.query;

    const result = await this.listPublicCoursesUseCase.execute({
      page:  page  ? parseInt(page  as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      filter: {
        category: category as string | undefined,
        level:    level    as string | undefined,
        language: language as string | undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        search:   search   as string | undefined,
        sort:     sort     as PublicCourseSort | undefined,
      },
    });

    return res.status(200).json(result);
  }

  async deleteCourse(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.deleteCourseUseCase.execute({
      courseId: req.params.courseId,
      tutorId:  authReq.user!.userId,
    });

    return res.status(200).json(result);
  }

  async uploadThumbnail(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploadableFile: UploadableFile = {
      buffer:       req.file.buffer,
      originalname: req.file.originalname,
      mimetype:     req.file.mimetype,
      size:         req.file.size,
    };

    const result = await this.uploadThumbnailUseCase.execute({
      courseId: req.params.courseId,
      tutorId:  authReq.user!.userId,
      file:     uploadableFile,
    });

    return res.status(200).json(result);
  }

  async publishCourse(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.publishCourseUseCase.execute({
      courseId: req.params.courseId,
      tutorId:  authReq.user!.userId,
    });

    return res.status(200).json(result);
  }

  async unpublishCourse(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.unpublishCourseUseCase.execute({
      courseId: req.params.courseId,
      tutorId:  authReq.user!.userId,
    });

    return res.status(200).json(result);
  }

  async archiveCourse(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.archiveCourseUseCase.execute({
      courseId: req.params.courseId,
      tutorId:  authReq.user!.userId,
    });

    return res.status(200).json(result);
  }

  //  Module Management 

  async addModule(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.addModuleUseCase.execute({
      courseId:    req.params.courseId,
      tutorId:     authReq.user!.userId,
      title:       req.body.title,
      description: req.body.description ?? null,
    });

    return res.status(201).json(result);
  }

  async updateModule(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.updateModuleUseCase.execute({
      courseId:    req.params.courseId,
      tutorId:     authReq.user!.userId,
      moduleId:    req.params.moduleId,
      title:       req.body.title,
      description: req.body.description,
    });

    return res.status(200).json(result);
  }

  async removeModule(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.removeModuleUseCase.execute({
      courseId: req.params.courseId,
      tutorId:  authReq.user!.userId,
      moduleId: req.params.moduleId,
    });

    return res.status(200).json(result);
  }

  async reorderModules(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.reorderModulesUseCase.execute({
      courseId:   req.params.courseId,
      tutorId:    authReq.user!.userId,
      orderedIds: req.body.orderedIds,
    });

    return res.status(200).json(result);
  }

  //  Lesson Management 

  async addLesson(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.addLessonUseCase.execute({
      courseId:    req.params.courseId,
      tutorId:     authReq.user!.userId,
      moduleId:    req.params.moduleId,
      title:       req.body.title,
      description: req.body.description ?? null,
      isPreview:   req.body.isPreview,
    });

    return res.status(201).json(result);
  }

  async updateLesson(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.updateLessonUseCase.execute({
      courseId:    req.params.courseId,
      tutorId:     authReq.user!.userId,
      moduleId:    req.params.moduleId,
      lessonId:    req.params.lessonId,
      title:       req.body.title,
      description: req.body.description,
      isPreview:   req.body.isPreview,
    });

    return res.status(200).json(result);
  }

  async removeLesson(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.removeLessonUseCase.execute({
      courseId: req.params.courseId,
      tutorId:  authReq.user!.userId,
      moduleId: req.params.moduleId,
      lessonId: req.params.lessonId,
    });

    return res.status(200).json(result);
  }

  async reorderLessons(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.reorderLessonsUseCase.execute({
      courseId:   req.params.courseId,
      tutorId:    authReq.user!.userId,
      moduleId:   req.params.moduleId,
      orderedIds: req.body.orderedIds,
    });

    return res.status(200).json(result);
  }

  //  Chapter Management 

  async addChapter(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.addChapterUseCase.execute({
      courseId:  req.params.courseId,
      tutorId:   authReq.user!.userId,
      moduleId:  req.params.moduleId,
      lessonId:  req.params.lessonId,
      title:     req.body.title,
      type:      req.body.type,
      isFree:    req.body.isFree,
      content:   req.body.content  ?? null,
      duration:  req.body.duration,
    });

    return res.status(201).json(result);
  }

  async updateChapter(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.updateChapterUseCase.execute({
      courseId:  req.params.courseId,
      tutorId:   authReq.user!.userId,
      moduleId:  req.params.moduleId,
      lessonId:  req.params.lessonId,
      chapterId: req.params.chapterId,
      title:     req.body.title,
      isFree:    req.body.isFree,
      content:   req.body.content,
      duration:  req.body.duration,
    });

    return res.status(200).json(result);
  }

  async removeChapter(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.removeChapterUseCase.execute({
      courseId:  req.params.courseId,
      tutorId:   authReq.user!.userId,
      moduleId:  req.params.moduleId,
      lessonId:  req.params.lessonId,
      chapterId: req.params.chapterId,
    });

    return res.status(200).json(result);
  }

  async reorderChapters(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.reorderChaptersUseCase.execute({
      courseId:   req.params.courseId,
      tutorId:    authReq.user!.userId,
      moduleId:   req.params.moduleId,
      lessonId:   req.params.lessonId,
      orderedIds: req.body.orderedIds,
    });

    return res.status(200).json(result);
  }

  // Video Upload

  async getVideoUploadUrl(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.getVideoUploadUrlUseCase.execute({
      courseId:  req.params.courseId,
      tutorId:   authReq.user!.userId,
      moduleId:  req.params.moduleId,
      lessonId:  req.params.lessonId,
      chapterId: req.params.chapterId,
      filename:  req.body.filename,
      mimeType:  req.body.mimeType,
      size:      req.body.size,
    });

    return res.status(200).json(result);
  }

  async confirmVideoUpload(req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const result = await this.confirmVideoUploadUseCase.execute({
      courseId:  req.params.courseId,
      tutorId:   authReq.user!.userId,
      moduleId:  req.params.moduleId,
      lessonId:  req.params.lessonId,
      chapterId: req.params.chapterId,
      duration:  req.body.duration,
    });

    return res.status(200).json(result);
  }
}
