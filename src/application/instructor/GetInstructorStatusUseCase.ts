import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';

export interface InstructorStatusResult {
  hasApplication: boolean;
  application?: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason: string | null;
    cooldownExpiresAt: Date | null;
    bio: string;
    experienceYears: string;
    teachingExperience: 'yes' | 'no';
    courseIntent: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    language: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

@injectable()
export class GetInstructorStatusUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort
  ) {}

  async execute(userId: string): Promise<InstructorStatusResult> {
    const application = await this.applicationRepository.findByUserId(userId);

    if (!application) {
      return { hasApplication: false };
    }

    return {
      hasApplication: true,
      application: {
        id: application.id,
        status: application.status as 'pending' | 'approved' | 'rejected',
        rejectionReason: application.rejectionReason,
        cooldownExpiresAt: application.cooldownExpiresAt,
        bio: application.bio,
        experienceYears: application.experienceYears,
        teachingExperience: application.teachingExperience,
        courseIntent: application.courseIntent,
        level: application.level,
        language: application.language,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
      },
    };
  }
}