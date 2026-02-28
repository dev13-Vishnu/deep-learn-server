import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { InstructorApplication } from '../../domain/entities/InstructorApplication';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/idGenerator';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import {
  ApplyForInstructorRequestDTO,
  ApplyForInstructorResponseDTO,
} from '../dto/instructor/ApplyForInstructor.dto';
import { InstructorApplicationMapper } from '../mappers/InstructorApplicationMapper';

@injectable()
export class ApplyForInstructorUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort,

    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(
    dto: ApplyForInstructorRequestDTO
  ): Promise<ApplyForInstructorResponseDTO> {
    const existing = await this.applicationRepository.findByUserId(dto.userId);

    if (existing) {
      if (existing.status === 'rejected' && existing.isCooldownActive()) {
        throw new AppError(
          `You cannot reapply until ${existing.cooldownExpiresAt!.toISOString()}. ` +
            `Cooldown expires on ${existing.cooldownExpiresAt!.toLocaleDateString()}.`,
          403
        );
      }
      if (existing.status === 'pending') {
        throw new AppError('You already have a pending application', 400);
      }
      if (existing.status === 'approved') {
        throw new AppError('Your application has already been approved', 400);
      }
    }

    let application: InstructorApplication;
    try {
      application = InstructorApplication.create(
        generateId(),
        dto.userId,
        dto.bio,
        dto.experienceYears,
        dto.teachingExperience,
        dto.courseIntent,
        dto.level,
        dto.language
      );
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    await this.applicationRepository.create(application);

    const user = await this.userRepository.findById(dto.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    try {
      user.setInstructorState('pending');
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    await this.userRepository.update(user);

    return {
      message: 'Instructor application submitted',
      application: InstructorApplicationMapper.toDTO(application),
    };
  }
}