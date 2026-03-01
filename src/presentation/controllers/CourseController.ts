import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { AuthenticatedRequest } from '../../infrastructure/security/jwt-auth.middleware';
import { CreateCourseUseCase } from '../../application/course/CreateCourseUseCase';

@injectable()
export class CourseController {
  constructor(
    @inject(TYPES.CreateCourseUseCase)
    private readonly createCourseUseCase: CreateCourseUseCase
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
}