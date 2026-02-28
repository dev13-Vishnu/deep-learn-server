import { InstructorApplicationData, ApplicantSnapshot } from './InstructorApplicationData.dto';

export interface ListInstructorApplicationsRequestDTO {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ApplicationListItem extends InstructorApplicationData {
  applicant: ApplicantSnapshot | null;
}

export interface ListInstructorApplicationsResponseDTO {
  applications: ApplicationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}