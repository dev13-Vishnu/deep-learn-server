import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { AppError } from '../../shared/errors/AppError';

@injectable()
export class RejectInstructorApplicationUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort
  ) {}

  async execute(applicationId: string, reason?: string) {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    if (application.status === 'rejected') {
      throw new AppError('Application already rejected', 400);
    }

    application.status = 'rejected';
    application.rejectionReason = reason || null;
    await this.applicationRepository.update(application);

    return {
      message: 'Application rejected',
      application,
    };
  }
}