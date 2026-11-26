import { HttpError } from '../../Shared/domain/HttpError';
import { SocioRepository } from '../../Socio/domain/SocioRepository';
import { Ubicacion } from '../domain/Ubicacion';
import { UbicacionRepository } from '../domain/UbicacionRepository';

/** Última ubicación compartida por el socio autenticado. */
export class GetMyUbicacionUseCase {
  constructor(
    private readonly socioRepository: SocioRepository,
    private readonly ubicacionRepository: UbicacionRepository
  ) {}

  async run(userId: string): Promise<Ubicacion | null> {
    const socio = await this.socioRepository.findByUserId(userId);

    if (!socio) {
      throw new HttpError(404, 'Tu usuario no tiene un perfil de socio asociado.');
    }

    return this.ubicacionRepository.findLatestBySocioId(socio.id);
  }
}
