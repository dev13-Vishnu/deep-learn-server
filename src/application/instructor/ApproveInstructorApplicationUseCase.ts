import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { AppError } from '../../shared/errors/AppError';

@injectable()
export class ApproveInstructorApplicationUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort,

    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(applicationId: string) {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    if (application.status === 'approved') {
      throw new AppError('Application already approved', 400);
    }

    // Update application status
    application.status = 'approved';
    await this.applicationRepository.update(application);

    // Upgrade user role to instructor (1)
    const user = await this.userRepository.findById(application.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Assuming role 1 = Instructor
    // Note: You might need to add a setRole method to User entity
    await this.userRepository.updateRole(user.id, 1);

    return {
      message: 'Application approved successfully',
      application,
    };
  }
}