import { UpdateLessonRequestDTO, UpdateLessonResponseDTO } from '../../../dto/course/Lesson.dto';
export interface IUpdateLessonUseCase {
  execute(dto: UpdateLessonRequestDTO): Promise<UpdateLessonResponseDTO>;
}