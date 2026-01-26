import { Response } from 'express';
import { ApplyForInstructorUseCase } from '../../application/instructor/ApplyForInstructorUseCase';
import { GetInstructorStatusUseCase } from '../../application/instructor/GetInstructorStatusUseCase';
import { AuthenticatedRequest } from '../../infrastructure/security/jwt-auth.middleware';

export class InstructorController {
  constructor(
    private applyUseCase: ApplyForInstructorUseCase,
    private statusUseCase: GetInstructorStatusUseCase
  ) {}

  apply = async (req: AuthenticatedRequest, res: Response) => {
    await this.applyUseCase.execute({
      userId: req.user!.userId,
      ...req.body,
    });

    res.status(201).json({ message: 'Application submitted' });
  };

  status = async (req: AuthenticatedRequest, res: Response) => {
    const result = await this.statusUseCase.execute(
      req.user!.userId
    );
    res.json(result);
  };
}
