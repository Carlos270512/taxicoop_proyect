import { Election } from '../domain/Election';
import { VotacionRepository } from '../domain/VotacionRepository';
import { HttpError } from '../../Shared/domain/HttpError';

export class GetElectionByIdUseCase {
  constructor(private readonly votacionRepository: VotacionRepository) {}

  async run(id: string, userId?: string): Promise<Election> {
    const election = await this.votacionRepository.findElectionById(id, userId);
    if (!election) {
      throw new HttpError(404, 'Elección no encontrada.');
    }
    return election;
  }
}
