import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { InstructorApplication } from '../../domain/entities/InstructorApplication';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { DomainError } from '../../domain/errors/DomainError';
import { ApplyForInstructorRequestDTO, ApplyForInstructorResponseDTO } from '../dto/instructor/ApplyForInstructor.dto';
import { InstructorApplicationMapper } from '../mappers/InstructorApplicationMapper';
import { IdGeneratorPort } from '../ports/IdGeneratorPort';
import { IApplyForInstructorUseCase } from '../ports/inbound/instructor/IApplyForInstructorUseCase';

@injectable()
export class ApplyForInstructorUseCase implements IApplyForInstructorUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort,
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @inject(TYPES.IdGeneratorPort)
    private readonly idGenerator: IdGeneratorPort,
  ) {}

  async execute(dto: ApplyForInstructorRequestDTO): Promise<ApplyForInstructorResponseDTO> {
    const existing = await this.applicationRepository.findByUserId(dto.userId);

    if (existing) {
      if (existing.status === 'rejected' && existing.isCooldownActive()) {
        throw new ApplicationError(
          'APPLICATION_COOLDOWN_ACTIVE',
          `You cannot reapply until ${existing.cooldownExpiresAt!.toISOString()}. ` +
          `Cooldown expires on ${existing.cooldownExpiresAt!.toLocaleDateString()}.`
        );
      }
      if (existing.status === 'pending') {
        throw new ApplicationError('APPLICATION_ALREADY_PENDING', 'You already have a pending application');
      }
      if (existing.status === 'approved') {
        throw new ApplicationError('APPLICATION_ALREADY_APPROVED', 'Your application has already been approved');
      }
    }

    let application: InstructorApplication;
    try {
      application = InstructorApplication.create(
        this.idGenerator.generate(), dto.userId, dto.bio,
        dto.experienceYears, dto.teachingExperience, dto.courseIntent, dto.level, dto.language
      );
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

    await this.applicationRepository.create(application);

    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new ApplicationError('USER_NOT_FOUND', 'User not found');
    }

    try {
      user.setInstructorState('pending');
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw new ApplicationError('DOMAIN_RULE_VIOLATED', error.message);
      }
      throw error;
    }

    await this.userRepository.update(user);

    return {
      message:     'Instructor application submitted',
      application: InstructorApplicationMapper.toDTO(application),
    };
  }
}