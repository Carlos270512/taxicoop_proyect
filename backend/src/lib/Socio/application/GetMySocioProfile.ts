import { SocioRepository } from '../domain/SocioRepository';
import { UnidadRepository } from '../../Unidad/domain/UnidadRepository';
import { Socio } from '../domain/Socio';
import { Unidad } from '../../Unidad/domain/Unidad';
import { HttpError } from '../../Shared/domain/HttpError';

export type MySocioProfile = {
  socio: Socio;
  unidades: Unidad[];
};

/** Perfil del socio autenticado: sus datos y sus unidades. */
export class GetMySocioProfileUseCase {
  constructor(
    private readonly socioRepository: SocioRepository,
    private readonly unidadRepository: UnidadRepository
  ) {}

  async run(userId: string): Promise<MySocioProfile> {
    const socio = await this.socioRepository.findByUserId(userId);

    if (!socio) {
      throw new HttpError(404, 'Tu usuario no tiene un perfil de socio asociado.');
    }

    const unidades = await this.unidadRepository.findAll({
      socioId: socio.id,
      page: 1,
      limit: 50,
    });

    return { socio, unidades: unidades.items };
  }
}
