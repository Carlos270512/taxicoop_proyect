import { UnidadRepository } from '../domain/UnidadRepository';
import { Unidad } from '../domain/Unidad';
import { SocioRepository } from '../../Socio/domain/SocioRepository';
import { v4 as uuidv4 } from 'uuid';

export class CreateUnidadUseCase {
  constructor(
    private readonly unidadRepository: UnidadRepository,
    private readonly socioRepository: SocioRepository
  ) {}

  async run(data: { numeroUnidad: string; placa: string; anioVehiculo: number; socioId: string }): Promise<Unidad> {
    const socio = await this.socioRepository.findById(data.socioId);
    if (!socio) {
      throw new Error('El socio especificado no existe en el sistema.');
    }

    const unidad = new Unidad(
      uuidv4(),
      data.numeroUnidad,
      data.placa,
      data.anioVehiculo,
      data.socioId,
      'OPERATIVA'
    );

    return await this.unidadRepository.save(unidad);
  }
}