import { SocioRepository } from '../domain/SocioRepository';
import { UnidadRepository } from '../../Unidad/domain/UnidadRepository';
import { Socio } from '../domain/Socio';
import { HttpError } from '../../Shared/domain/HttpError';

/**
 * Baja logica: el socio pasa a RETIRADO y se conserva todo el historial.
 * No se borra la fila porque las unidades dependen de ella (ON DELETE RESTRICT).
 * Sus unidades se suspenden para que no queden "operando" sin socio activo.
 */
export class RetireSocioUseCase {
  constructor(
    private readonly socioRepository: SocioRepository,
    private readonly unidadRepository: UnidadRepository
  ) {}

  async run(id: string): Promise<Socio> {
    const socio = await this.socioRepository.findById(id);
    if (!socio) {
      throw new HttpError(404, 'Socio no encontrado.');
    }

    const updated = await this.socioRepository.updateEstado(id, 'RETIRADO');
    if (!updated) {
      throw new HttpError(404, 'Socio no encontrado.');
    }

    await this.unidadRepository.suspendBySocioId(id);

    return updated;
  }
}
