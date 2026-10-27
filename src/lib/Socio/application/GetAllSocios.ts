import { SocioRepository } from '../domain/SocioRepository';
import { Socio } from '../domain/Socio';

export class GetAllSociosUseCase {
  constructor(private readonly socioRepository: SocioRepository) {}

  async run(): Promise<Socio[]> {
    return await this.socioRepository.findAll();
  }
}