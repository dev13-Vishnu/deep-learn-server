import { inject, injectable } from 'inversify';
import { InstructorApplicationRepository } from '../../domain/instructor/InstructorApplicationRepository';
import { TYPES } from '../../shared/di/types';

@injectable()
export class GetInstructorStatusUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepository)
    private instructorRepo: InstructorApplicationRepository
  ) {}

  async execute(userId: string) {
    return this.instructorRepo.findByUserId(userId);
  }
}
