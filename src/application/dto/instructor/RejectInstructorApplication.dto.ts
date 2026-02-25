import { InstructorApplicationData } from './InstructorApplicationData.dto';

export interface RejectInstructorApplicationRequestDTO {
  applicationId: string;
  reason: string;
}

export interface RejectInstructorApplicationResponseDTO {
  message: string;
  application: InstructorApplicationData;
  cooldown: {
    expiresAt: string;
    durationDays: number;
  };
}