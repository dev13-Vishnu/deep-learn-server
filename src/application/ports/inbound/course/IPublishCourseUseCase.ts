import { PublishCourseRequestDTO, PublishCourseResponseDTO } from '../../../dto/course/PublishCourse.dto';
export interface IPublishCourseUseCase {
  execute(dto: PublishCourseRequestDTO): Promise<PublishCourseResponseDTO>;
}