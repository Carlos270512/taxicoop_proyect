import { SocioRepository } from '../domain/SocioRepository';
import { Socio } from '../domain/Socio';
import { v4 as uuidv4 } from 'uuid';

interface CreateSocioDTO {
  userId: string;
  cedulaRuc: string;
  nombres: string;
  apellidos: string;
  telefono: string;
}

export class CreateSocioUseCase {
  constructor(private readonly socioRepository: SocioRepository) {}

  async run(data: CreateSocioDTO): Promise<Socio> {
    const socio = new Socio(
      uuidv4(),
      data.userId, // 👈 Pasamos el userId que viene del cliente
      data.cedulaRuc,
      data.nombres,
      data.apellidos,
      data.telefono,
      'ACTIVO'
    );
    return await this.socioRepository.save(socio);
  }
}