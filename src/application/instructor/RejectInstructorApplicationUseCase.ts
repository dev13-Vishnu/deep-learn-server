import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { instructorConfig } from '../../shared/config/instructor.config';
import { LoggerPort } from '../ports/LoggerPort';
import { DomainError } from '../../domain/errors/DomainError';
import { RejectInstructorApplicationRequestDTO, RejectInstructorApplicationResponseDTO } from '../dto/instructor/RejectInstructorApplication.dto';
import { InstructorApplicationMapper } from '../mappers/InstructorApplicationMapper';
import { IRejectInstructorApplicationUseCase } from '../ports/inbound/instructor/IRejectInstructorApplicationUseCase';

@injectable()
export class RejectInstructorApplicationUseCase implements IRejectInstructorApplicationUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort,
    @inject(TYPES.UserReaderPort)
    private readonly userRepository: UserRepositoryPort,
    @inject(TYPES.LoggerPort)
    private readonly logger: LoggerPort,
  ) {}

  async execute(request: RejectInstructorApplicationRequestDTO): Promise<RejectInstructorApplicationResponseDTO> {
    const application = await this.applicationRepository.findById(request.applicationId);
    if (!application) {
      throw new ApplicationError('APPLICATION_NOT_FOUND', 'Application not found');
    }
    if (!request.reason || request.reason.trim().length === 0) {
      throw new ApplicationError('VALIDATION_ERROR', 'Rejection reason is required');
    }

    const cooldownExpiresAt = new Date(Date.now() + instructorConfig.cooldown.durationMs);

    try {
      application.reject(request.reason, cooldownExpiresAt);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
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
          throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
        }
        throw error;
      }
      await this.userRepository.update(user);
    }

    this.logger.info(
      `[AUDIT] Application rejected | applicationId=${request.applicationId} userId=${application.userId} reason="${request.reason}" cooldownUntil=${cooldownExpiresAt.toISOString()} at=${new Date().toISOString()}`
    );

    return {
      message:     'Application rejected',
      application: InstructorApplicationMapper.toDTO(application),
      cooldown: {
        expiresAt:    cooldownExpiresAt.toISOString(),
        durationDays: instructorConfig.cooldown.durationDays,
      },
    };
  }
}