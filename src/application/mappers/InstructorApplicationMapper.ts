import { InstructorApplication } from '../../domain/entities/InstructorApplication';
import { InstructorApplicationData } from '../dto/instructor/InstructorApplicationData.dto';
import { AppError } from '../../shared/errors/AppError';

export class InstructorApplicationMapper {
  static toDTO(entity: InstructorApplication): InstructorApplicationData {
    if (!entity) {
      throw new AppError('Cannot map null InstructorApplication entity', 500);
    }

    return {
      id: entity.id,
      userId: entity.userId,
      bio: entity.bio,
      experienceYears: entity.experienceYears,
      teachingExperience: entity.teachingExperience,
      courseIntent: entity.courseIntent,
      level: entity.level,
      language: entity.language,
      status: entity.status,
      rejectionReason: entity.rejectionReason,
      cooldownExpiresAt: entity.cooldownExpiresAt
        ? entity.cooldownExpiresAt.toISOString()
        : null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}