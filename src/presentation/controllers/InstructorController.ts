import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { IApplyForInstructorUseCase }            from '../../application/ports/inbound/instructor/IApplyForInstructorUseCase';
import { IGetInstructorStatusUseCase }           from '../../application/ports/inbound/instructor/IGetInstructorStatusUseCase';
import { IListInstructorApplicationsUseCase }    from '../../application/ports/inbound/instructor/IListInstructorApplicationsUseCase';
import { IApproveInstructorApplicationUseCase }  from '../../application/ports/inbound/instructor/IApproveInstructorApplicationUseCase';
import { IRejectInstructorApplicationUseCase }   from '../../application/ports/inbound/instructor/IRejectInstructorApplicationUseCase';

@injectable()
export class InstructorController {
  constructor(
    @inject(TYPES.ApplyForInstructorUseCase)
    private readonly applyForInstructorUseCase: IApplyForInstructorUseCase,

    @inject(TYPES.GetInstructorStatusUseCase)
    private readonly getInstructorStatusUseCase: IGetInstructorStatusUseCase,

    @inject(TYPES.ListInstructorApplicationsUseCase)
    private readonly listApplicationsUseCase: IListInstructorApplicationsUseCase,

    @inject(TYPES.ApproveInstructorApplicationUseCase)
    private readonly approveApplicationUseCase: IApproveInstructorApplicationUseCase,

    @inject(TYPES.RejectInstructorApplicationUseCase)
    private readonly rejectApplicationUseCase: IRejectInstructorApplicationUseCase,
  ) {}

  async apply(data: { userId: string; bio: string; experienceYears: string; teachingExperience: 'yes' | 'no'; courseIntent: string; level: 'beginner' | 'intermediate' | 'advanced'; language: string }) {
    return this.applyForInstructorUseCase.execute(data);
  }

  async getStatus(userId: string) {
    return this.getInstructorStatusUseCase.execute(userId);
  }

  async listApplications(params: { page?: number; limit?: number; status?: 'pending' | 'approved' | 'rejected' }) {
    return this.listApplicationsUseCase.execute(params);
  }

  async approveApplication(applicationId: string) {
    return this.approveApplicationUseCase.execute({ applicationId });
  }

  async rejectApplication(applicationId: string, reason: string) {
    return this.rejectApplicationUseCase.execute({ applicationId, reason });
  }
}