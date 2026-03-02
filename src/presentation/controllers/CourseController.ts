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
    private readonly publishCourseUseCase: PublishCourseUseCase
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
}
