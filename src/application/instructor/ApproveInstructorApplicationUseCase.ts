import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { UserRole } from '../../domain/entities/UserRole';
import { DomainError } from '../../domain/errors/DomainError';
import { logger } from '../../shared/utils/logger';
import {
  ApproveInstructorApplicationRequestDTO,
  ApproveInstructorApplicationResponseDTO,
} from '../dto/instructor/ApproveInstructorApplication.dto';
import { InstructorApplicationMapper } from '../mappers/InstructorApplicationMapper';

@injectable()
export class ApproveInstructorApplicationUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort,

    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(
    request: ApproveInstructorApplicationRequestDTO
  ): Promise<ApproveInstructorApplicationResponseDTO> {
    const application = await this.applicationRepository.findById(
      request.applicationId
    );

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    try {
      application.approve();
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    await this.applicationRepository.update(application);

    const user = await this.userRepository.findById(application.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.id) {
      throw new AppError('User ID not found', 500);
    }

    await this.userRepository.updateRole(user.id, UserRole.TUTOR);

    try {
      user.setInstructorState('approved');
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    await this.userRepository.update(user);

    logger.info(
      `[AUDIT] Application approved | applicationId=${request.applicationId} userId=${application.userId} at=${new Date().toISOString()}`
    );

    return {
      message: 'Application approved successfully',
      application: InstructorApplicationMapper.toDTO(application),
    };
  }
}