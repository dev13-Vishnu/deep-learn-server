import { InstructorApplication } from '../../domain/entities/InstructorApplication';

export interface InstructorApplicationFilter {
  status?: 'pending' | 'approved' | 'rejected';
}

export interface InstructorApplicationRepositoryPort {
  create(application: InstructorApplication): Promise<void>;
  findById(id: string): Promise<InstructorApplication | null>;
  findByUserId(userId: string): Promise<InstructorApplication | null>;
  findAll(
    filter: InstructorApplicationFilter,
    skip: number,
    limit: number
  ): Promise<InstructorApplication[]>;
  count(filter: InstructorApplicationFilter): Promise<number>;
  update(application: InstructorApplication): Promise<void>;
}