import { Request,Response } from 'express';
import { inject, injectable } from 'inversify';

import { TYPES } from '../../shared/di/types';

import { ApplyForInstructorUseCase } from '../../application/instructor/ApplyForInstructorUseCase';
import { GetInstructorStatusUseCase } from '../../application/instructor/GetInstructorStatusUseCase';
import { AuthenticatedRequest } from '../../infrastructure/security/jwt-auth.middleware';

import { ListInstructorApplicationsUseCase } from '../../application/instructor/ListInstructorApplicationsUseCase';
import { ApproveInstructorApplicationUseCase } from '../../application/instructor/ApproveInstructorApplicationUseCase';
import { RejectInstructorApplicationUseCase } from '../../application/instructor/RejectInstructorApplicationUseCase';

@injectable()
export class InstructorController {
  constructor(
    @inject(TYPES.ApplyForInstructorUseCase)
    private readonly applyForInstructorUseCase: ApplyForInstructorUseCase,

    @inject(TYPES.GetInstructorStatusUseCase)
    private readonly getInstructorStatusUseCase: GetInstructorStatusUseCase

     @inject(TYPES.ListInstructorApplicationsUseCase)
    private readonly listApplicationsUseCase: ListInstructorApplicationsUseCase,

    @inject(TYPES.ApproveInstructorApplicationUseCase)
    private readonly approveApplicationUseCase: ApproveInstructorApplicationUseCase,

    @inject(TYPES.RejectInstructorApplicationUseCase)
    private readonly rejectApplicationUseCase: RejectInstructorApplicationUseCase
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
    

  async getStatus(req: Request, res: Response) : Promise <Response>{
  const authReq = req as AuthenticatedRequest;

  const status = await this.getInstructorStatusUseCase.execute(
    authReq.user!.userId
  );

  return res.status(200).json({
    status: status
  });
}

async listApplications(req: Request, res: Response): Promise<Response> {
    const { page, limit, status } = req.query;

    const result = await this.listApplicationsUseCase.execute({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as any,
    });

    return res.status(200).json(result);
  }

  /* ================= ADMIN: APPROVE APPLICATION ================= */

  async approveApplication(req: Request, res: Response): Promise<Response> {
    const { applicationId } = req.params;

    const result = await this.approveApplicationUseCase.execute(applicationId);

    return res.status(200).json(result);
  }

  /* ================= ADMIN: REJECT APPLICATION ================= */

  async rejectApplication(req: Request, res: Response): Promise<Response> {
    const { applicationId } = req.params;
    const { reason } = req.body;

    const result = await this.rejectApplicationUseCase.execute(
      applicationId,
      reason
    );

    return res.status(200).json(result);
  }


}
