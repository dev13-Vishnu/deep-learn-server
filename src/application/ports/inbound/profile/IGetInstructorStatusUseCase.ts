import { InstructorStatusResult } from '../../../dto/instructor/GetInstructorStatus.dto';

export interface IGetInstructorStatusUseCase {
  execute(userId: string): Promise<InstructorStatusResult>;
}