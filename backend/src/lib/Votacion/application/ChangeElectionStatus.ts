import { Election } from '../domain/Election';
import { VotacionRepository } from '../domain/VotacionRepository';
import { HttpError } from '../../Shared/domain/HttpError';
import { parseElectionStatus } from './election.validation';

export class ChangeElectionStatusUseCase {
  constructor(private readonly votacionRepository: VotacionRepository) {}

  async run(id: string, status: unknown): Promise<Election> {
    const nextStatus = parseElectionStatus(status);

    const election = await this.votacionRepository.findElectionById(id);
    if (!election) {
      throw new HttpError(404, 'Elección no encontrada.');
    }

    if (election.status === nextStatus) {
      return election;
    }

    if (election.status === 'CLOSED') {
      throw new HttpError(409, 'Una elección cerrada no se puede reabrir.');
    }

    if (nextStatus === 'ACTIVE' && election.options.length < 2) {
      throw new HttpError(409, 'La elección necesita al menos 2 opciones para activarse.');
    }

    const updated = await this.votacionRepository.updateStatus(id, nextStatus);
    if (!updated) {
      throw new HttpError(404, 'Elección no encontrada.');
    }
    return updated;
  }
}
