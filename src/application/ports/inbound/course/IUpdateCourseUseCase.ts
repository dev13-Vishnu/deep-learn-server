import { UpdateCourseRequestDTO, UpdateCourseResponseDTO } from '../../../dto/course/UpdateCourse.dto';
export interface IUpdateCourseUseCase {
  execute(dto: UpdateCourseRequestDTO): Promise<UpdateCourseResponseDTO>;
}