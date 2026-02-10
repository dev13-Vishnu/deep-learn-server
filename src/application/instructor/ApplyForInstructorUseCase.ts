import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { InstructorApplication } from '../../domain/entities/InstructorApplication';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/idGenerator';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';

interface ApplyForInstructorDTO {
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
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort,

    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(dto: ApplyForInstructorDTO) {
    // Check for existing application
    const existing = await this.applicationRepository.findByUserId(dto.userId);

    if (existing) {
      throw new AppError('You have already submitted an application', 400);
    }

    // Use entity's create factory method (validates business rules)
    let application: InstructorApplication;
    try {
      application = InstructorApplication.create(
        generateId(),  // Generate ID
        dto.userId,
        dto.bio,
        dto.experienceYears,
        dto.teachingExperience,
        dto.courseIntent,
        dto.level,
        dto.language
      );
    } catch (error: any) {
      if (error.name === 'DomainError') {
        throw new AppError(error.message, 400);
      }
      throw error;
    }

    await this.applicationRepository.create(application);

    // UPDATE USER'S INSTRUCTOR STATE TO PENDING
    const user = await this.userRepository.findById(dto.userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.instructorState = 'pending';
    await this.userRepository.update(user);

    return { application };
  }
}