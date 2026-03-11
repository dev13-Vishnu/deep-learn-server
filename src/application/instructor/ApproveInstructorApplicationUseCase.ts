import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { DomainError } from '../../domain/errors/DomainError';
import { LoggerPort } from '../ports/LoggerPort';
import { ApproveInstructorApplicationRequestDTO, ApproveInstructorApplicationResponseDTO } from '../dto/instructor/ApproveInstructorApplication.dto';
import { InstructorApplicationMapper } from '../mappers/InstructorApplicationMapper';
import { IApproveInstructorApplicationUseCase } from '../ports/inbound/instructor/IApproveInstructorApplicationUseCase';

@injectable()
export class ApproveInstructorApplicationUseCase implements IApproveInstructorApplicationUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort,
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @inject(TYPES.LoggerPort)
    private readonly logger: LoggerPort,
  ) {}

  async execute(request: ApproveInstructorApplicationRequestDTO): Promise<ApproveInstructorApplicationResponseDTO> {
    const application = await this.applicationRepository.findById(request.applicationId);
    if (!application) {
      throw new ApplicationError('APPLICATION_NOT_FOUND', 'Application not found');
    }

    try {
      application.approve();
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

    await this.applicationRepository.update(application);

    const user = await this.userRepository.findById(application.userId);
    if (!user) {
      throw new ApplicationError('USER_NOT_FOUND', 'User not found');
    }
    if (!user.id) {
      throw new ApplicationError('INTERNAL_ERROR', 'User ID not found');
    }

    try {
      user.upgradeToInstructor();
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

    await this.userRepository.update(user);

    this.logger.info(
      `[AUDIT] Application approved | applicationId=${request.applicationId} userId=${application.userId} at=${new Date().toISOString()}`
    );

    return {
      message:     'Application approved successfully',
      application: InstructorApplicationMapper.toDTO(application),
    };
  }
}