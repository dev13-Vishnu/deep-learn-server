import { InstructorApplication } from "../entities/InstructorApplication";

export interface InstructorApplicationRepository {
  findByUserId(userId: string): Promise<InstructorApplication | null>;
  create(application: InstructorApplication): Promise<void>;
}
