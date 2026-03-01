import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { AuthenticatedRequest } from '../../infrastructure/security/jwt-auth.middleware';
import { CreateCourseUseCase } from '../../application/course/CreateCourseUseCase';
import { UpdateCourseUseCase } from '../../application/course/UpdateCourseUseCase';

@injectable()
export class CourseController {
  constructor(
    @inject(TYPES.CreateCourseUseCase)
    private readonly createCourseUseCase: CreateCourseUseCase,

    @inject(TYPES.UpdateCourseUseCase)
    private readonly updateCourseUseCase: UpdateCourseUseCase
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
}