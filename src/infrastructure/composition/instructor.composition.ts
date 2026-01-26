import { ApplyForInstructorUseCase } from '../../application/instructor/ApplyForInstructorUseCase';
import { GetInstructorStatusUseCase } from '../../application/instructor/GetInstructorStatusUseCase';
import { InstructorController } from '../../presentation/controllers/InstructorController';
import { MongoInstructorApplicationRepository } from '../database/repositories/MongoInstructorApplicationRepository';

export function buildInstructorController() {
  const repo = new MongoInstructorApplicationRepository();

  return new InstructorController(
    new ApplyForInstructorUseCase(repo),
    new GetInstructorStatusUseCase(repo)
  );
}
