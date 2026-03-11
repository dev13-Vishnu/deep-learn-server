import { ReorderLessonsRequestDTO, ReorderLessonsResponseDTO } from '../../../dto/course/Lesson.dto';
export interface IReorderLessonsUseCase {
  execute(dto: ReorderLessonsRequestDTO): Promise<ReorderLessonsResponseDTO>;
}