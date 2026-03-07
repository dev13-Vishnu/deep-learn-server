import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { ApplyForInstructorUseCase } from '../../application/instructor/ApplyForInstructorUseCase';
import { GetInstructorStatusUseCase } from '../../application/instructor/GetInstructorStatusUseCase';
import { ListInstructorApplicationsUseCase } from '../../application/instructor/ListInstructorApplicationsUseCase';
import { ApproveInstructorApplicationUseCase } from '../../application/instructor/ApproveInstructorApplicationUseCase';
import { RejectInstructorApplicationUseCase } from '../../application/instructor/RejectInstructorApplicationUseCase';

@injectable()
export class InstructorController {
  constructor(
    @inject(TYPES.ApplyForInstructorUseCase)
    private readonly applyForInstructorUseCase: ApplyForInstructorUseCase,

    @inject(TYPES.GetInstructorStatusUseCase)
    private readonly getInstructorStatusUseCase: GetInstructorStatusUseCase,

    @inject(TYPES.ListInstructorApplicationsUseCase)
    private readonly listApplicationsUseCase: ListInstructorApplicationsUseCase,

    @inject(TYPES.ApproveInstructorApplicationUseCase)
    private readonly approveApplicationUseCase: ApproveInstructorApplicationUseCase,

    @inject(TYPES.RejectInstructorApplicationUseCase)
    private readonly rejectApplicationUseCase: RejectInstructorApplicationUseCase,
  ) {}

  async apply(data: { userId: string; bio: string; experienceYears: string; teachingExperience: 'yes' | 'no'; courseIntent: string; level: 'beginner' | 'intermediate' | 'advanced'; language: string;
  }) {
    return this.applyForInstructorUseCase.execute(data);
  }

  async getStatus(userId: string) {
    return this.getInstructorStatusUseCase.execute(userId);
  }

  async listApplications(params: { page?: number; limit?: number; status?: 'pending' | 'approved' | 'rejected';
  }) {
    return this.listApplicationsUseCase.execute(params);
  }

  async approveApplication(applicationId: string) {
    return this.approveApplicationUseCase.execute({ applicationId });
  }

  async rejectApplication(applicationId: string, reason: string) {
    return this.rejectApplicationUseCase.execute({ applicationId, reason });
  }
}