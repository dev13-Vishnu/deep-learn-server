import { UpdateModuleRequestDTO, UpdateModuleResponseDTO } from '../../../dto/course/Module.dto';
export interface IUpdateModuleUseCase {
  execute(dto: UpdateModuleRequestDTO): Promise<UpdateModuleResponseDTO>;
}