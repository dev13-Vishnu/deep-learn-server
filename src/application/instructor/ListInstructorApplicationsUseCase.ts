import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InstructorApplicationRepositoryPort } from '../ports/InstructorApplicationRepositoryPort';
import { UserReaderPort } from '../ports/UserReaderPort';

interface ListApplicationsQuery {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
}

@injectable()
export class ListInstructorApplicationsUseCase {
  constructor(
    @inject(TYPES.InstructorApplicationRepositoryPort)
    private readonly applicationRepository: InstructorApplicationRepositoryPort,

    // Inject the reader so we can fetch applicant user data for each card
    @inject(TYPES.UserReaderPort)
    private readonly userReader: UserReaderPort
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

    // Fetch the applicant's profile for each application so the admin card
    // can display name, email, and avatar without a separate lookup.
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const user = await this.userReader.findById(app.userId);
        return {
          // Spread the flat application fields
          id: app.id,
          userId: app.userId,
          bio: app.bio,
          experienceYears: app.experienceYears,
          teachingExperience: app.teachingExperience,
          courseIntent: app.courseIntent,
          level: app.level,
          language: app.language,
          status: app.status,
          rejectionReason: app.rejectionReason ?? null,
          cooldownExpiresAt: app.cooldownExpiresAt
            ? app.cooldownExpiresAt.toISOString()
            : null,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
          // Applicant snapshot — null-safe so a missing user never crashes the list
          applicant: user
            ? {
                firstName: user.firstName ?? null,
                lastName: user.lastName ?? null,
                email: user.email.getValue(),
                avatarUrl: user.avatar ?? null,
              }
            : null,
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