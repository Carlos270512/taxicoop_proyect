import { VotacionRepository } from '../domain/VotacionRepository';
import { Election, ElectionStatus } from '../domain/Election';
import { Option } from '../domain/Option';
import crypto from 'crypto';

interface CreateElectionDTO {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: ElectionStatus;
  options: Array<{ title: string; description?: string }>;
}

export class CreateElectionUseCase {
  constructor(private readonly votacionRepository: VotacionRepository) {}

  async run(dto: CreateElectionDTO): Promise<Election> {
    const electionId = crypto.randomUUID();

    const options = dto.options.map(
      (opt) => new Option(crypto.randomUUID(), electionId, opt.title, opt.description || '')
    );

    const election = new Election(
      electionId,
      dto.title,
      dto.description,
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.status || 'DRAFT',
      options
    );

    return await this.votacionRepository.createElection(election);
  }
}