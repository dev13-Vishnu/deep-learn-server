import { InstructorApplication } from '../../domain/entities/InstructorApplication';
import { InstructorApplicationData } from '../dto/instructor/InstructorApplicationData.dto';
import { ApplicationError } from '../../shared/errors/ApplicationError';

export class InstructorApplicationMapper {
  static toDTO(entity: InstructorApplication): InstructorApplicationData {
    if (!entity) {
      throw new ApplicationError('INTERNAL_ERROR', 'Cannot map null InstructorApplication entity');
    }
    return {
      id:                 entity.id,
      userId:             entity.userId,
      bio:                entity.bio,
      experienceYears:    entity.experienceYears,
      teachingExperience: entity.teachingExperience,
      courseIntent:       entity.courseIntent,
      level:              entity.level,
      language:           entity.language,
      status:             entity.status,
      rejectionReason:    entity.rejectionReason,
      cooldownExpiresAt:  entity.cooldownExpiresAt ? entity.cooldownExpiresAt.toISOString() : null,
      createdAt:          entity.createdAt,
      updatedAt:          entity.updatedAt,
    };
  }
}