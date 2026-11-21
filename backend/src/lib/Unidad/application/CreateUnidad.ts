import crypto from 'crypto';
import { UnidadRepository } from '../domain/UnidadRepository';
import { Unidad } from '../domain/Unidad';
import { SocioRepository } from '../../Socio/domain/SocioRepository';
import { HttpError } from '../../Shared/domain/HttpError';
import { assertAnioVehiculo, assertNumeroUnidad, assertPlaca, parseEstadoUnidad } from './unidad.validation';

export type CreateUnidadDTO = {
  numeroUnidad: string;
  placa: string;
  anioVehiculo: number | string;
  socioId: string;
  estado?: string;
};

export class CreateUnidadUseCase {
  constructor(
    private readonly unidadRepository: UnidadRepository,
    private readonly socioRepository: SocioRepository
  ) {}

  async run(dto: CreateUnidadDTO): Promise<Unidad> {
    const numeroUnidad = assertNumeroUnidad(dto.numeroUnidad);
    const placa = assertPlaca(dto.placa);
    const anioVehiculo = assertAnioVehiculo(dto.anioVehiculo);
    const estado = parseEstadoUnidad(dto.estado, 'OPERATIVA');

    const socio = await this.socioRepository.findById(String(dto.socioId ?? ''));
    if (!socio) {
      throw new HttpError(404, 'El socio indicado no existe.');
    }
    if (socio.estado !== 'ACTIVO') {
      throw new HttpError(409, `El socio está ${socio.estado}: no se le pueden asignar unidades.`);
    }

    if (await this.unidadRepository.findByPlaca(placa)) {
      throw new HttpError(409, 'Ya existe una unidad registrada con esa placa.');
    }
    if (await this.unidadRepository.findByNumero(numeroUnidad)) {
      throw new HttpError(409, 'Ya existe una unidad registrada con ese número.');
    }

    const unidad = new Unidad(crypto.randomUUID(), numeroUnidad, placa, anioVehiculo, socio.id, estado);

    return await this.unidadRepository.save(unidad);
  }
}
