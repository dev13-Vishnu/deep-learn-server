import { GetTutorCourseRequestDTO, GetTutorCourseResponseDTO } from '../../../dto/course/GetTutorCourse.dto';
export interface IGetTutorCourseUseCase {
  execute(dto: GetTutorCourseRequestDTO): Promise<GetTutorCourseResponseDTO>;
}