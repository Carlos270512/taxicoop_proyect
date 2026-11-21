import { UnidadRepository, UpdateUnidadData } from '../domain/UnidadRepository';
import { Unidad } from '../domain/Unidad';
import { SocioRepository } from '../../Socio/domain/SocioRepository';
import { HttpError } from '../../Shared/domain/HttpError';
import { assertAnioVehiculo, assertNumeroUnidad, assertPlaca } from './unidad.validation';

export type UpdateUnidadDTO = {
  numeroUnidad?: string;
  placa?: string;
  anioVehiculo?: number | string;
  socioId?: string;
};

export class UpdateUnidadUseCase {
  constructor(
    private readonly unidadRepository: UnidadRepository,
    private readonly socioRepository: SocioRepository
  ) {}

  async run(id: string, dto: UpdateUnidadDTO): Promise<Unidad> {
    const unidad = await this.unidadRepository.findById(id);
    if (!unidad) {
      throw new HttpError(404, 'Unidad no encontrada.');
    }

    const data: UpdateUnidadData = {};

    if (dto.numeroUnidad !== undefined) {
      const numeroUnidad = assertNumeroUnidad(dto.numeroUnidad);
      if (numeroUnidad !== unidad.numeroUnidad) {
        const existente = await this.unidadRepository.findByNumero(numeroUnidad);
        if (existente && existente.id !== id) {
          throw new HttpError(409, 'Ya existe otra unidad con ese número.');
        }
        data.numeroUnidad = numeroUnidad;
      }
    }

    if (dto.placa !== undefined) {
      const placa = assertPlaca(dto.placa);
      if (placa !== unidad.placa) {
        const existente = await this.unidadRepository.findByPlaca(placa);
        if (existente && existente.id !== id) {
          throw new HttpError(409, 'Ya existe otra unidad con esa placa.');
        }
        data.placa = placa;
      }
    }

    if (dto.anioVehiculo !== undefined) {
      data.anioVehiculo = assertAnioVehiculo(dto.anioVehiculo);
    }

    if (dto.socioId !== undefined) {
      const socio = await this.socioRepository.findById(String(dto.socioId));
      if (!socio) {
        throw new HttpError(404, 'El socio indicado no existe.');
      }
      if (socio.estado !== 'ACTIVO') {
        throw new HttpError(409, `El socio está ${socio.estado}: no se le pueden asignar unidades.`);
      }
      data.socioId = socio.id;
    }

    if (Object.keys(data).length === 0) {
      throw new HttpError(400, 'No se enviaron campos para actualizar.');
    }

    const updated = await this.unidadRepository.update(id, data);
    if (!updated) {
      throw new HttpError(404, 'Unidad no encontrada.');
    }
    return updated;
  }
}
