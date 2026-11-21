import { UnidadListResult, UnidadRepository } from '../domain/UnidadRepository';
import { parsePagination } from '../../Shared/application/pagination';
import { parseEstadoUnidad } from './unidad.validation';

export type GetAllUnidadesDTO = {
  q?: string;
  estado?: string;
  socioId?: string;
  page?: string | number;
  limit?: string | number;
};

export class GetAllUnidadesUseCase {
  constructor(private readonly unidadRepository: UnidadRepository) {}

  async run(dto: GetAllUnidadesDTO = {}): Promise<UnidadListResult> {
    const { page, limit } = parsePagination(dto.page, dto.limit);
    const q = dto.q ? String(dto.q).trim() : undefined;
    const estado = dto.estado ? parseEstadoUnidad(dto.estado) : undefined;
    const socioId = dto.socioId ? String(dto.socioId).trim() : undefined;

    return await this.unidadRepository.findAll({
      q: q || undefined,
      estado,
      socioId: socioId || undefined,
      page,
      limit,
    });
  }
}
