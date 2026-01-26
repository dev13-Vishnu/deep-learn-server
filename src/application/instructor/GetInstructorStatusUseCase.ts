import { InstructorApplicationRepository } from '../../domain/instructor/InstructorApplicationRepository';

export class GetInstructorStatusUseCase {
  constructor(
    private instructorRepo: InstructorApplicationRepository
  ) {}

  async execute(userId: string) {
    return this.instructorRepo.findByUserId(userId);
  }
}
