import { DeleteCourseRequestDTO, DeleteCourseResponseDTO } from '../../../dto/course/DeleteCourse.dto';
export interface IDeleteCourseUseCase {
  execute(dto: DeleteCourseRequestDTO): Promise<DeleteCourseResponseDTO>;
}