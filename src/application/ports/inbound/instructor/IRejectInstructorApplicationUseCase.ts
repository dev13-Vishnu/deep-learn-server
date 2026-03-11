import { RejectInstructorApplicationRequestDTO, RejectInstructorApplicationResponseDTO } from '../../../dto/instructor/RejectInstructorApplication.dto';

export interface IRejectInstructorApplicationUseCase {
  execute(dto: RejectInstructorApplicationRequestDTO): Promise<RejectInstructorApplicationResponseDTO>;
}