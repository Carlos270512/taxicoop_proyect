import { Election } from '../domain/Election';
import { VotacionRepository } from '../domain/VotacionRepository';

export class GetActiveElectionsUseCase {
  constructor(private readonly votacionRepository: VotacionRepository) {}

  async run(): Promise<Election[]> {
    return await this.votacionRepository.findActiveElections();
  }
}
