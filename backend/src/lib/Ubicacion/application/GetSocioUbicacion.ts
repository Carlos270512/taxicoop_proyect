import { HttpError } from '../../Shared/domain/HttpError';
import { SocioRepository } from '../../Socio/domain/SocioRepository';
import { Ubicacion } from '../domain/Ubicacion';
import { UbicacionRepository } from '../domain/UbicacionRepository';

export type SocioUbicacion = {
  socioId: string;
  ultima: Ubicacion | null;
  historial: Ubicacion[];
};

const HISTORY_LIMIT = 10;

/** Última ubicación y recorrido reciente de un socio (solo administración). */
export class GetSocioUbicacionUseCase {
  constructor(
    private readonly socioRepository: SocioRepository,
    private readonly ubicacionRepository: UbicacionRepository
  ) {}

  async run(socioId: string): Promise<SocioUbicacion> {
    const socio = await this.socioRepository.findById(socioId);

    if (!socio) {
      throw new HttpError(404, 'Socio no encontrado.');
    }

    const [ultima, historial] = await Promise.all([
      this.ubicacionRepository.findLatestBySocioId(socioId),
      this.ubicacionRepository.findHistoryBySocioId(socioId, HISTORY_LIMIT),
    ]);

    return { socioId, ultima, historial };
  }
}
