import { InstructorApplicationRepository } from '../../domain/instructor/InstructorApplicationRepository';
import { InstructorApplication } from '../../domain/instructor/InstructorApplication';
import { AppError } from '../../shared/errors/AppError';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types';

interface ApplyForInstructorInput {
  userId: string;
  bio: string;
  experienceYears: string;
  teachingExperience: 'yes' | 'no';
  courseIntent: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
}

@injectable()
export class ApplyForInstructorUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepository)
    private instructorRepo: InstructorApplicationRepository
  ) {}

  async execute(input: ApplyForInstructorInput): Promise<void> {
    const existing =
      await this.instructorRepo.findByUserId(input.userId);

    if (existing && existing.status === 'pending') {
      throw new AppError(
        'Instructor application already pending',
        400
      );
    }

    const application: InstructorApplication = {
      id: crypto.randomUUID(),
      userId: input.userId,
      bio: input.bio,
      experienceYears: input.experienceYears,
      teachingExperience: input.teachingExperience,
      courseIntent: input.courseIntent,
      level: input.level,
      language: input.language,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.instructorRepo.create(application);
  }
}
