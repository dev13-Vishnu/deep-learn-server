import { ListTutorCoursesRequestDTO, ListTutorCoursesResponseDTO } from '../../../dto/course/ListTutorCourses.dto';
export interface IListTutorCoursesUseCase {
  execute(dto: ListTutorCoursesRequestDTO): Promise<ListTutorCoursesResponseDTO>;
}