import { SocioRepository } from '../domain/SocioRepository';
import { Socio } from '../domain/Socio';
import { HttpError } from '../../Shared/domain/HttpError';

export class GetSocioByIdUseCase {
  constructor(private readonly socioRepository: SocioRepository) {}

  async run(id: string): Promise<Socio> {
    const socio = await this.socioRepository.findById(id);
    if (!socio) {
      throw new HttpError(404, 'Socio no encontrado.');
    }
    return socio;
  }
}
