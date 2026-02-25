import { injectable } from 'inversify';
import {
  InstructorApplicationRepositoryPort,
  InstructorApplicationFilter,
} from '../../../application/ports/InstructorApplicationRepositoryPort';
import { InstructorApplication } from '../../../domain/entities/InstructorApplication';
import {
  InstructorApplicationModel,
  IInstructorApplicationDocument,
} from '../models/InstructorApplicationModel';
import { Types } from 'mongoose';

@injectable()
export class MongoInstructorApplicationRepository
  implements InstructorApplicationRepositoryPort
{
  async findByUserId(userId: string): Promise<InstructorApplication | null> {
    const doc = await InstructorApplicationModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findById(id: string): Promise<InstructorApplication | null> {
    const doc = await InstructorApplicationModel.findById(id);
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAll(
    filter: InstructorApplicationFilter,
    skip: number,
    limit: number
  ): Promise<InstructorApplication[]> {
    const mongoFilter = this.toMongoFilter(filter);
    const docs = await InstructorApplicationModel.find(mongoFilter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return docs.map((doc) => this.toDomain(doc));
  }

  async count(filter: InstructorApplicationFilter): Promise<number> {
    const mongoFilter = this.toMongoFilter(filter);
    return InstructorApplicationModel.countDocuments(mongoFilter);
  }

  async create(application: InstructorApplication): Promise<void> {
    await InstructorApplicationModel.create(this.toPersistence(application));
  }

  async update(application: InstructorApplication): Promise<void> {
    await InstructorApplicationModel.updateOne(
      { _id: application.id },
      { $set: this.toPersistence(application) }
    );
  }

  private toMongoFilter(
    filter: InstructorApplicationFilter
  ): Record<string, unknown> {
    const mongoFilter: Record<string, unknown> = {};
    if (filter.status !== undefined) {
      mongoFilter.status = filter.status;
    }
    return mongoFilter;
  }

  private toDomain(doc: IInstructorApplicationDocument): InstructorApplication {
    return InstructorApplication.reconstruct(
      doc._id.toString(),
      doc.userId.toString(),
      doc.bio,
      doc.experienceYears,
      doc.teachingExperience,
      doc.courseIntent,
      doc.level,
      doc.language,
      doc.status,
      doc.rejectionReason ?? null,
      doc.cooldownExpiresAt ?? null,
      doc.createdAt,
      doc.updatedAt
    );
  }

  private toPersistence(
    app: InstructorApplication
  ): Partial<IInstructorApplicationDocument> {
    return {
      userId: app.userId as unknown as Types.ObjectId,
      bio: app.bio,
      experienceYears: app.experienceYears,
      teachingExperience: app.teachingExperience,
      courseIntent: app.courseIntent,
      level: app.level,
      language: app.language,
      status: app.status,
      rejectionReason: app.rejectionReason,
      cooldownExpiresAt: app.cooldownExpiresAt ?? null,
      updatedAt: new Date(),
    };
  }
}