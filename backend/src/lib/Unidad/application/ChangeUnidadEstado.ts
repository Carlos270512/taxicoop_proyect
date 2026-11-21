import { UnidadRepository } from '../domain/UnidadRepository';
import { Unidad } from '../domain/Unidad';
import { HttpError } from '../../Shared/domain/HttpError';
import { parseEstadoUnidad } from './unidad.validation';

export class ChangeUnidadEstadoUseCase {
  constructor(private readonly unidadRepository: UnidadRepository) {}

  async run(id: string, estado: unknown): Promise<Unidad> {
    const nuevoEstado = parseEstadoUnidad(estado);

    const unidad = await this.unidadRepository.findById(id);
    if (!unidad) {
      throw new HttpError(404, 'Unidad no encontrada.');
    }

    const updated = await this.unidadRepository.updateEstado(id, nuevoEstado);
    if (!updated) {
      throw new HttpError(404, 'Unidad no encontrada.');
    }
    return updated;
  }
}
