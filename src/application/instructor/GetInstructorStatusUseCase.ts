import { inject, injectable } from 'inversify';
import { InstructorApplicationRepository } from '../../domain/instructor/InstructorApplicationRepository';
import { TYPES } from '../../shared/di/types';

@injectable()
export class GetInstructorStatusUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepository)
    private instructorRepo: InstructorApplicationRepository
  ) {}

  async execute(userId: string): Promise<{
    status: 'pending' | 'approved' | 'rejected' | 'blocked' | null;
  }> {
    const application = await this.instructorRepo.findByUserId(userId);

    if (!application) {
      return { status: null };
    }

    return { status: application.status };
  }
}
