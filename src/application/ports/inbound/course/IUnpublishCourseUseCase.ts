import { UnpublishCourseRequestDTO, UnpublishCourseResponseDTO } from '../../../dto/course/UnpublishArchiveCourse.dto';
export interface IUnpublishCourseUseCase {
  execute(dto: UnpublishCourseRequestDTO): Promise<UnpublishCourseResponseDTO>;
}