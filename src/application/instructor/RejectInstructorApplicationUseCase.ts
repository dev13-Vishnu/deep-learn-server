import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { instructorConfig } from '../../shared/config/instructor.config';
import { logger } from '../../shared/utils/logger';
import { DomainError } from '../../domain/errors/DomainError';
import {
  RejectInstructorApplicationRequestDTO,
  RejectInstructorApplicationResponseDTO,
} from '../dto/instructor/RejectInstructorApplication.dto';
import { InstructorApplicationMapper } from '../mappers/InstructorApplicationMapper';

@injectable()
export class RejectInstructorApplicationUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort,

    @inject(TYPES.UserReaderPort)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(
    request: RejectInstructorApplicationRequestDTO
  ): Promise<RejectInstructorApplicationResponseDTO> {
    const application = await this.applicationRepository.findById(
      request.applicationId
    );

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    if (!request.reason || request.reason.trim().length === 0) {
      throw new AppError('Rejection reason is required', 400);
    }

    const cooldownExpiresAt = new Date(
      Date.now() + instructorConfig.cooldown.durationMs
    );

    try {
      application.reject(request.reason, cooldownExpiresAt);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    await this.applicationRepository.update(application);

    const user = await this.userRepository.findById(application.userId);

    if (user) {
      try {
        user.setInstructorState('rejected');
      } catch (error: unknown) {
        if (error instanceof DomainError) {
          throw new AppError(error.message, 400);
        }
        throw error;
      }
      await this.userRepository.update(user);
    }

    logger.info(
      `[AUDIT] Application rejected | applicationId=${request.applicationId} userId=${application.userId} reason="${request.reason}" cooldownUntil=${cooldownExpiresAt.toISOString()} at=${new Date().toISOString()}`
    );

    return {
      message: 'Application rejected',
      application: InstructorApplicationMapper.toDTO(application),
      cooldown: {
        expiresAt: cooldownExpiresAt.toISOString(),
        durationDays: instructorConfig.cooldown.durationDays,
      },
    };
  }
}