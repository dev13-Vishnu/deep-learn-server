import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';

interface ListApplicationsQuery {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
}

@injectable()
export class ListInstructorApplicationsUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort
  ) {}

  async execute(query: ListApplicationsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) {
      filter.status = query.status;
    }

    const applications = await this.applicationRepository.findAll(
      filter,
      skip,
      limit
    );

    const total = await this.applicationRepository.count(filter);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}