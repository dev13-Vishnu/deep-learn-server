import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { UserRole } from '../../domain/entities/UserRole';
import { logger } from '../../shared/utils/logger';

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

    // Use entity's business logic
    try {
      application.approve();  // Throws DomainError if invalid
    } catch (error: any) {
      if (error.name === 'DomainError') {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    // Save updated application
    await this.applicationRepository.update(application);

    // Upgrade user role
    const user = await this.userRepository.findById(application.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.id) {
      throw new AppError('User ID not found', 500);
    }

    await this.userRepository.updateRole(user.id, UserRole.TUTOR);

    user.instructorState = 'approved';
    await this.userRepository.update(user);

    logger.info(
      `[AUDIT] Application approved | applicationId=${applicationId} userId=${application.userId} at=${new Date().toISOString()}`
    )

    return {
      message: 'Application approved successfully',
      application,
    };
  }
}