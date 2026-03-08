import { GetPublicCourseRequestDTO, GetPublicCourseResponseDTO } from '../../../dto/course/GetPublicCourse.dto';
export interface IGetPublicCourseUseCase {
  execute(dto: GetPublicCourseRequestDTO): Promise<GetPublicCourseResponseDTO>;
}