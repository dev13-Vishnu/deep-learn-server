import { injectable } from 'inversify';
import { InstructorApplicationStatus } from '../../../domain/instructor/InstructorApplication';
import { InstructorApplicationRepository } from '../../../domain/instructor/InstructorApplicationRepository';
import { InstructorApplicationModel } from '../models/InstructorApplicationModel';
import { InstructorApplication } from '../../../domain/entities/InstructorApplication';

@injectable()
export class MongoInstructorApplicationRepository
  implements InstructorApplicationRepository
{
  async findByUserId(
  userId: string
): Promise<InstructorApplication | null> {
  const doc = await InstructorApplicationModel.findOne({ userId });
  if (!doc) return null;

  const obj = doc.toObject();

  if (
    !isTeachingExperience(obj.teachingExperience) ||
    !isLevel(obj.level) ||
    !isStatus(obj.status)
  ) {
    throw new Error('Invalid instructor application data');
  }

  return {
    id: obj._id.toString(),
    userId: obj.userId,
    bio: obj.bio,
    experienceYears: obj.experienceYears,
    teachingExperience: obj.teachingExperience,
    courseIntent: obj.courseIntent,
    level: obj.level,
    language: obj.language,
    status: obj.status,
    adminFeedback: obj.adminFeedback ?? undefined,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}



  async create(application: InstructorApplication): Promise<void> {
    await InstructorApplicationModel.create(application);
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

  return docs.map(this.toDomain);
}

async count(filter: any): Promise<number> {
  return await InstructorApplicationModel.countDocuments(filter);
}

private toDomain(doc: IInstructorApplicationDocument): InstructorApplication {
  return new InstructorApplication(
    doc._id.toString(),
    doc.userId.toString(),
    doc.bio,
    doc.experienceYears,
    doc.teachingExperience,
    doc.courseIntent,
    doc.level,
    doc.language,
    doc.status,
    doc.rejectionReason || null,  // ← ADD
    doc.createdAt,
    doc.updatedAt
  );
}

private toPersistence(app: InstructorApplication): Partial<IInstructorApplicationDocument> {
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

function isTeachingExperience(
  value: string
): value is 'yes' | 'no' {
  return value === 'yes' || value === 'no';
}

function isLevel(
  value: string
): value is 'beginner' | 'intermediate' | 'advanced' {
  return (
    value === 'beginner' ||
    value === 'intermediate' ||
    value === 'advanced'
  );
}

function isStatus(
  value: string
): value is InstructorApplicationStatus {
  return (
    value === 'pending' ||
    value === 'approved' ||
    value === 'rejected' ||
    value === 'blocked'
  );

  
}


