import { UnidadRepository } from '../domain/UnidadRepository';
import { Unidad } from '../domain/Unidad';

export class GetAllUnidadesUseCase {
  constructor(private readonly unidadRepository: UnidadRepository) {}

  async run(): Promise<Unidad[]> {
    return await this.unidadRepository.findAll();
  }
}