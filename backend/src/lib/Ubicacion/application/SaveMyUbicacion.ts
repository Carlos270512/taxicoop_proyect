import { HttpError } from '../../Shared/domain/HttpError';
import { SocioRepository } from '../../Socio/domain/SocioRepository';
import { Ubicacion } from '../domain/Ubicacion';
import { UbicacionRepository } from '../domain/UbicacionRepository';
import { parseUbicacionInput, UbicacionInput } from './ubicacion.validation';

/** El socio autenticado comparte su ubicación actual. */
export class SaveMyUbicacionUseCase {
  constructor(
    private readonly socioRepository: SocioRepository,
    private readonly ubicacionRepository: UbicacionRepository
  ) {}

  async run(userId: string, input: UbicacionInput): Promise<Ubicacion> {
    const socio = await this.socioRepository.findByUserId(userId);

    if (!socio) {
      throw new HttpError(404, 'Tu usuario no tiene un perfil de socio asociado.');
    }

    const data = parseUbicacionInput(input, socio.id);
    return this.ubicacionRepository.save(data);
  }
}
