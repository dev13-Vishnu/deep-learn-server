import { injectable } from 'inversify';
import { InstructorApplicationRepositoryPort } from '../../../application/ports/InstructorApplicationRepositoryPort';
import { InstructorApplication } from '../../../domain/entities/InstructorApplication';
import { 
  InstructorApplicationModel,
  IInstructorApplicationDocument 
} from '../models/InstructorApplicationModel';

@injectable()
export class MongoInstructorApplicationRepository
  implements InstructorApplicationRepositoryPort
{
  async findByUserId(
    userId: string
  ): Promise<InstructorApplication | null> {
    const doc = await InstructorApplicationModel.findOne({ userId });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findById(id: string): Promise<InstructorApplication | null> {
    const doc = await InstructorApplicationModel.findById(id);
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAll(
    filter: any,
    skip: number,
    limit: number
  ): Promise<InstructorApplication[]> {
    const docs = await InstructorApplicationModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return docs.map((doc) => this.toDomain(doc));
  }

  async count(filter: any): Promise<number> {
    return await InstructorApplicationModel.countDocuments(filter);
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

  // ← FIX THIS METHOD
  private toDomain(doc: IInstructorApplicationDocument): InstructorApplication {
    return new InstructorApplication(
      doc._id.toString(),
      doc.userId.toString(),
      doc.bio,
      doc.experienceYears,
      doc.teachingExperience,  // Already typed as 'yes' | 'no'
      doc.courseIntent,
      doc.level,  // Already typed as 'beginner' | 'intermediate' | 'advanced'
      doc.language,
      doc.status,  // Already typed as 'pending' | 'approved' | 'rejected'
      doc.rejectionReason || null,  // ← ADD
      doc.createdAt,
      doc.updatedAt
    );
  }

  // ← FIX THIS METHOD
  private toPersistence(
    app: InstructorApplication
  ): Partial<IInstructorApplicationDocument> {
    return {
      userId: app.userId as any,
      bio: app.bio,
      experienceYears: app.experienceYears,
      teachingExperience: app.teachingExperience,
      courseIntent: app.courseIntent,
      level: app.level,
      language: app.language,
      status: app.status,
      rejectionReason: app.rejectionReason,  // ← ADD
      updatedAt: new Date(),
    };
  }
}