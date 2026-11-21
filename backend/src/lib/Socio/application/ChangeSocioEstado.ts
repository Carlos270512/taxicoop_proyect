import { SocioRepository } from '../domain/SocioRepository';
import { UnidadRepository } from '../../Unidad/domain/UnidadRepository';
import { Socio } from '../domain/Socio';
import { HttpError } from '../../Shared/domain/HttpError';
import { parseEstado } from './socio.validation';

export class ChangeSocioEstadoUseCase {
  constructor(
    private readonly socioRepository: SocioRepository,
    private readonly unidadRepository: UnidadRepository
  ) {}

  async run(id: string, estado: unknown): Promise<Socio> {
    const nuevoEstado = parseEstado(estado);

    const socio = await this.socioRepository.findById(id);
    if (!socio) {
      throw new HttpError(404, 'Socio no encontrado.');
    }

    const updated = await this.socioRepository.updateEstado(id, nuevoEstado);
    if (!updated) {
      throw new HttpError(404, 'Socio no encontrado.');
    }

    // Un socio suspendido o retirado no puede tener unidades operando
    if (nuevoEstado !== 'ACTIVO') {
      await this.unidadRepository.suspendBySocioId(id);
    }

    return updated;
  }
}
