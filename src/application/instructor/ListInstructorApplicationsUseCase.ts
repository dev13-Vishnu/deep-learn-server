import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort, InstructorApplicationFilter } from '../ports/InstructorApplicationRepositoryPort';
import { UserReaderPort } from '../ports/UserReaderPort';
import {
  ListInstructorApplicationsRequestDTO,
  ListInstructorApplicationsResponseDTO,
  ApplicationListItem,
} from '../dto/instructor/ListInstructorApplications.dto';
import { InstructorApplicationMapper } from '../mappers/InstructorApplicationMapper';
import { UserMapper } from '../mappers/UserMapper';

@injectable()
export class ListInstructorApplicationsUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort,

    @inject(TYPES.UserReaderPort)
    private readonly userReader: UserReaderPort
  ) {}

  async execute(
    query: ListInstructorApplicationsRequestDTO
  ): Promise<ListInstructorApplicationsResponseDTO> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: InstructorApplicationFilter = {};
    if (query.status) {
      filter.status = query.status;
    }

    const applications = await this.applicationRepository.findAll(
      filter,
      skip,
      limit
    );

    const total = await this.applicationRepository.count(filter);

    const enriched: ApplicationListItem[] = await Promise.all(
      applications.map(async (app) => {
        const user = await this.userReader.findById(app.userId);
        const appData = InstructorApplicationMapper.toDTO(app);

        return {
          ...appData,
          applicant: user ? UserMapper.toApplicantSnapshot(user) : null,
        };
      })
    );

    return {
      applications: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}