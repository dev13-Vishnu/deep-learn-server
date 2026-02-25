import { InstructorApplicationData } from './InstructorApplicationData.dto';

export interface ApproveInstructorApplicationRequestDTO {
  applicationId: string;
}

export interface ApproveInstructorApplicationResponseDTO {
  message: string;
  application: InstructorApplicationData;
}