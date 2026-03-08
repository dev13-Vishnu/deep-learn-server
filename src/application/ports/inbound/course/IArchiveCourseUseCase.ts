import { ArchiveCourseRequestDTO, ArchiveCourseResponseDTO } from '../../../dto/course/UnpublishArchiveCourse.dto';
export interface IArchiveCourseUseCase {
  execute(dto: ArchiveCourseRequestDTO): Promise<ArchiveCourseResponseDTO>;
}