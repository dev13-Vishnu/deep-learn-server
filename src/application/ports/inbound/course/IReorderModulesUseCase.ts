import { ReorderModulesRequestDTO, ReorderModulesResponseDTO } from '../../../dto/course/Module.dto';
export interface IReorderModulesUseCase {
  execute(dto: ReorderModulesRequestDTO): Promise<ReorderModulesResponseDTO>;
}