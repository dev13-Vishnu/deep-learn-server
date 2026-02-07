import { inject, injectable } from 'inversify';
import { InstructorApplicationRepository } from '../../domain/instructor/InstructorApplicationRepository';
import { TYPES } from '../../shared/di/types';

@injectable()
export class GetInstructorStatusUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepository)
    private readonly applicationRepository: InstructorApplicationRepository
  ) {}

  async execute(userId: string): Promise<string | null> {
    const application = await this.applicationRepository.findByUserId(userId);

    if (!application) {
      return null
    }

    return application.status;
  }
}
