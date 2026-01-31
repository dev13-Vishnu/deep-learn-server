import { Request,Response } from 'express';
import { inject, injectable } from 'inversify';

import { TYPES } from '../../shared/di/types';

import { ApplyForInstructorUseCase } from '../../application/instructor/ApplyForInstructorUseCase';
import { GetInstructorStatusUseCase } from '../../application/instructor/GetInstructorStatusUseCase';
import { AuthenticatedRequest } from '../../infrastructure/security/jwt-auth.middleware';

@injectable()
export class InstructorController {
  constructor(
    @inject(TYPES.ApplyForInstructorUseCase)
    private readonly applyForInstructorUseCase: ApplyForInstructorUseCase,

    @inject(TYPES.GetInstructorStatusUseCase)
    private readonly getInstructorStatusUseCase: GetInstructorStatusUseCase
  ) {}

    /* ================= APPLY ================= */

  async apply (req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const application = await this.applyForInstructorUseCase.execute({
      userId: authReq.user!.userId,
      ...req.body,
    });

    return res.status(201).json({
      message: 'Instructor application submitted',
      application,
    });
  }

    /* ================= STATUS ================= */
    

  async getStatus (req: Request, res: Response): Promise<Response> {
    const authReq = req as AuthenticatedRequest;

    const status = await this.getInstructorStatusUseCase.execute(
      authReq.user!.userId
    );

    return res.status(200).json({ status });
  }
}
