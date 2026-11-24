import { ElectionResults } from '../domain/Election';
import { VotacionRepository } from '../domain/VotacionRepository';
import { HttpError } from '../../Shared/domain/HttpError';

export class GetElectionResultsUseCase {
  constructor(private readonly votacionRepository: VotacionRepository) {}

  async run(id: string, viewerRoles: string[] = []): Promise<ElectionResults> {
    const election = await this.votacionRepository.findElectionById(id);
    if (!election) {
      throw new HttpError(404, 'Elección no encontrada.');
    }

    const isAdmin = viewerRoles.includes('ADMIN');
    if (election.status !== 'CLOSED' && !isAdmin) {
      throw new HttpError(403, 'Los resultados estarán disponibles cuando la elección se cierre.');
    }

    const results = await this.votacionRepository.getResults(id);
    if (!results) {
      throw new HttpError(404, 'Elección no encontrada.');
    }

    return results;
  }
}
