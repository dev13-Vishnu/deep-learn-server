import { InstructorApplication } from '../../domain/entities/InstructorApplication';

export interface InstructorApplicationRepositoryPort {
  create(application: InstructorApplication): Promise<void>;
  findById(id: string): Promise<InstructorApplication | null>;
  findByUserId(userId: string): Promise<InstructorApplication | null>;
  findAll(filter: any, skip: number, limit: number): Promise<InstructorApplication[]>;  // ← ADD
  count(filter: any): Promise<number>;  // ← ADD
  update(application: InstructorApplication): Promise<void>;
}