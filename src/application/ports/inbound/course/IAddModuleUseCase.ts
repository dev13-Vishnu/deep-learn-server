import { AddModuleRequestDTO, AddModuleResponseDTO } from '../../../dto/course/Module.dto';
export interface IAddModuleUseCase {
  execute(dto: AddModuleRequestDTO): Promise<AddModuleResponseDTO>;
}