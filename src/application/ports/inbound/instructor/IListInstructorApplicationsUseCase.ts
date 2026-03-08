import { ListInstructorApplicationsRequestDTO, ListInstructorApplicationsResponseDTO } from '../../../dto/instructor/ListInstructorApplications.dto';

export interface IListInstructorApplicationsUseCase {
  execute(dto: ListInstructorApplicationsRequestDTO): Promise<ListInstructorApplicationsResponseDTO>;
}