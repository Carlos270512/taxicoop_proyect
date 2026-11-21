import { SocioRepository, UpdateSocioData } from '../domain/SocioRepository';
import { Socio } from '../domain/Socio';
import { HttpError } from '../../Shared/domain/HttpError';
import { assertCedula, assertName, assertTelefono } from './socio.validation';

export type UpdateSocioDTO = {
  cedulaRuc?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
};

export class UpdateSocioUseCase {
  constructor(private readonly socioRepository: SocioRepository) {}

  async run(id: string, dto: UpdateSocioDTO): Promise<Socio> {
    const socio = await this.socioRepository.findById(id);
    if (!socio) {
      throw new HttpError(404, 'Socio no encontrado.');
    }

    const data: UpdateSocioData = {};

    if (dto.cedulaRuc !== undefined) {
      const cedulaRuc = assertCedula(dto.cedulaRuc);
      if (cedulaRuc !== socio.cedulaRuc) {
        const existente = await this.socioRepository.findByCedula(cedulaRuc);
        if (existente && existente.id !== id) {
          throw new HttpError(409, 'Ya existe otro socio con esa cédula/RUC.');
        }
        data.cedulaRuc = cedulaRuc;
      }
    }

    if (dto.nombres !== undefined) data.nombres = assertName(dto.nombres, 'nombres');
    if (dto.apellidos !== undefined) data.apellidos = assertName(dto.apellidos, 'apellidos');
    if (dto.telefono !== undefined) data.telefono = assertTelefono(dto.telefono);

    if (Object.keys(data).length === 0) {
      throw new HttpError(400, 'No se enviaron campos para actualizar.');
    }

    const updated = await this.socioRepository.update(id, data);
    if (!updated) {
      throw new HttpError(404, 'Socio no encontrado.');
    }
    return updated;
  }
}
