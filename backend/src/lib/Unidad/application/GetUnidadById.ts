import { UnidadRepository } from '../domain/UnidadRepository';
import { Unidad } from '../domain/Unidad';
import { HttpError } from '../../Shared/domain/HttpError';

export class GetUnidadByIdUseCase {
  constructor(private readonly unidadRepository: UnidadRepository) {}

  async run(id: string): Promise<Unidad> {
    const unidad = await this.unidadRepository.findById(id);
    if (!unidad) {
      throw new HttpError(404, 'Unidad no encontrada.');
    }
    return unidad;
  }
}
