import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { instructorConfig } from '../../shared/config/instructor.config';
import { logger } from '../../shared/utils/logger';

@injectable()
export class RejectInstructorApplicationUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort,

    @inject(TYPES.UserReaderPort)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(applicationId: string, reason?: string) {
  const application = await this.applicationRepository.findById(applicationId);

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (!reason || reason.trim().length === 0) {
    throw new AppError('Rejection reason is required', 400);
  }

  // ── COMPUTE COOLDOWN ────────────────────────────────────────────────────
    const cooldownExpiresAt = new Date(
      Date.now() + instructorConfig.cooldown.durationMs
    );

  // Use entity's business logic
  try {
    application.reject(reason, cooldownExpiresAt);  // Throws DomainError if invalid
  } catch (error: any) {
    if (error.name === 'DomainError') {
      throw new AppError(error.message, 400);
    }
    throw error;
  }

  await this.applicationRepository.update(application);

  // Update users's instructor state to rejected
  const user = await this.userRepository.findById(application.userId);

  if(user) {
    user.instructorState = 'rejected';
    await this.userRepository.update(user);
  }

  // ── AUDIT LOG ───────────────────────────────────────────────────────────
    logger.info(
      `[AUDIT] Application rejected | applicationId=${applicationId} userId=${application.userId} reason="${reason}" cooldownUntil=${cooldownExpiresAt.toISOString()} at=${new Date().toISOString()}`
    );

  return {
    message: 'Application rejected',
    application,
    cooldown: {
      expiresAt: cooldownExpiresAt.toISOString(),
      durationDays: instructorConfig.cooldown.durationDays,
    }
  };
}
}