import { ElectionListResult, VotacionRepository } from '../domain/VotacionRepository';
import { parsePagination } from '../../Shared/application/pagination';
import { parseElectionStatus } from './election.validation';

export type GetElectionsDTO = {
  status?: string;
  page?: string | number;
  limit?: string | number;
};

export class GetElectionsUseCase {
  constructor(private readonly votacionRepository: VotacionRepository) {}

  async run(dto: GetElectionsDTO = {}): Promise<ElectionListResult> {
    const { page, limit } = parsePagination(dto.page, dto.limit);
    const status = dto.status ? parseElectionStatus(dto.status) : undefined;

    return await this.votacionRepository.findAll({ status, page, limit });
  }
}
