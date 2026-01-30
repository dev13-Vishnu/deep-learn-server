import { injectable } from 'inversify';
import { InstructorApplication, InstructorApplicationStatus } from '../../../domain/instructor/InstructorApplication';
import { InstructorApplicationRepository } from '../../../domain/instructor/InstructorApplicationRepository';
import { InstructorApplicationModel } from '../models/InstructorApplicationModel';

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


