import { SocioListResult, SocioRepository } from '../domain/SocioRepository';
import { parseEstado, parsePagination } from './socio.validation';

export type GetAllSociosDTO = {
  q?: string;
  estado?: string;
  page?: string | number;
  limit?: string | number;
};

export class GetAllSociosUseCase {
  constructor(private readonly socioRepository: SocioRepository) {}

  async run(dto: GetAllSociosDTO = {}): Promise<SocioListResult> {
    const { page, limit } = parsePagination(dto.page, dto.limit);
    const q = dto.q ? String(dto.q).trim() : undefined;
    const estado = dto.estado ? parseEstado(dto.estado) : undefined;

    return await this.socioRepository.findAll({
      q: q || undefined,
      estado,
      page,
      limit,
    });
  }
}