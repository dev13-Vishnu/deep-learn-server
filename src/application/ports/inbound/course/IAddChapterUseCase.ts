import { AddChapterRequestDTO, AddChapterResponseDTO } from '../../../dto/course/Chapter.dto';
export interface IAddChapterUseCase {
  execute(dto: AddChapterRequestDTO): Promise<AddChapterResponseDTO>;
}