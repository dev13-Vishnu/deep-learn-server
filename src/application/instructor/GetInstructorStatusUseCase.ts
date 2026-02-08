import { inject, injectable } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';

@injectable()
export class GetInstructorStatusUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
private readonly applicationRepository: InstructorApplicationRepositoryPort

  ) {}

  async execute(userId: string): Promise<string | null> {
    const application = await this.applicationRepository.findByUserId(userId);

    if (!application) {
      return null
    }

    return application.status;
  }
}
