import { ApproveInstructorApplicationRequestDTO, ApproveInstructorApplicationResponseDTO } from '../../../dto/instructor/ApproveInstructorApplication.dto';

export interface IApproveInstructorApplicationUseCase {
  execute(dto: ApproveInstructorApplicationRequestDTO): Promise<ApproveInstructorApplicationResponseDTO>;
}