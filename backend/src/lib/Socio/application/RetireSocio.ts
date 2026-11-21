import { SocioRepository } from '../domain/SocioRepository';
import { Socio } from '../domain/Socio';
import { HttpError } from '../../Shared/domain/HttpError';

/**
 * Baja logica: el socio pasa a RETIRADO y se conserva todo el historial.
 * No se borra la fila porque las unidades dependen de ella (ON DELETE RESTRICT).
 */
export class RetireSocioUseCase {
  constructor(private readonly socioRepository: SocioRepository) {}

  async run(id: string): Promise<Socio> {
    const socio = await this.socioRepository.findById(id);
    if (!socio) {
      throw new HttpError(404, 'Socio no encontrado.');
    }

    const updated = await this.socioRepository.updateEstado(id, 'RETIRADO');
    if (!updated) {
      throw new HttpError(404, 'Socio no encontrado.');
    }
    return updated;
  }
}
