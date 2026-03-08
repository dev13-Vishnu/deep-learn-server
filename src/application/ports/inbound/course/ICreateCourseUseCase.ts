import { CreateCourseRequestDTO, CreateCourseResponseDTO } from '../../../dto/course/CreateCourse.dto';
export interface ICreateCourseUseCase {
  execute(dto: CreateCourseRequestDTO): Promise<CreateCourseResponseDTO>;
}