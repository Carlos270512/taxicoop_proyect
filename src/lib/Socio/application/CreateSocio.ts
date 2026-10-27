import { SocioRepository } from '../domain/SocioRepository';
import { Socio } from '../domain/Socio';
import { v4 as uuidv4 } from 'uuid';

export class CreateSocioUseCase {
  constructor(private readonly socioRepository: SocioRepository) {}

  async run(data: { cedulaRuc: string; nombres: string; apellidos: string; telefono: string }): Promise<Socio> {
    const socio = new Socio(
      uuidv4(),
      data.cedulaRuc,
      data.nombres,
      data.apellidos,
      data.telefono,
      'ACTIVO'
    );
    return await this.socioRepository.save(socio);
  }
}