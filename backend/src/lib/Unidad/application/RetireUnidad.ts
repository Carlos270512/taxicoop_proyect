import { UnidadRepository } from '../domain/UnidadRepository';
import { Unidad } from '../domain/Unidad';
import { HttpError } from '../../Shared/domain/HttpError';

/**
 * Baja logica: la unidad pasa a SUSPENDIDA y se conserva el historial.
 */
export class RetireUnidadUseCase {
  constructor(private readonly unidadRepository: UnidadRepository) {}

  async run(id: string): Promise<Unidad> {
    const unidad = await this.unidadRepository.findById(id);
    if (!unidad) {
      throw new HttpError(404, 'Unidad no encontrada.');
    }

    const updated = await this.unidadRepository.updateEstado(id, 'SUSPENDIDA');
    if (!updated) {
      throw new HttpError(404, 'Unidad no encontrada.');
    }
    return updated;
  }
}
