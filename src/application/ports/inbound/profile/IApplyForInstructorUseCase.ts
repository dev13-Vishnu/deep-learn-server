import { ApplyForInstructorRequestDTO, ApplyForInstructorResponseDTO } from '../../../dto/instructor/ApplyForInstructor.dto';

export interface IApplyForInstructorUseCase {
  execute(dto: ApplyForInstructorRequestDTO): Promise<ApplyForInstructorResponseDTO>;
}