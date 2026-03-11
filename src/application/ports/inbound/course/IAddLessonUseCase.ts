import { AddLessonRequestDTO, AddLessonResponseDTO } from '../../../dto/course/Lesson.dto';
export interface IAddLessonUseCase {
  execute(dto: AddLessonRequestDTO): Promise<AddLessonResponseDTO>;
}