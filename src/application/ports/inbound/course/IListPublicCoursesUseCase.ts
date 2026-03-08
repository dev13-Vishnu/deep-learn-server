import { ListPublicCoursesRequestDTO, ListPublicCoursesResponseDTO } from '../../../dto/course/ListPublicCourses.dto';
export interface IListPublicCoursesUseCase {
  execute(dto: ListPublicCoursesRequestDTO): Promise<ListPublicCoursesResponseDTO>;
}