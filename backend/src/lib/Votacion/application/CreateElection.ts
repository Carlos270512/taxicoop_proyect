import crypto from 'crypto';
import { VotacionRepository } from '../domain/VotacionRepository';
import { Election } from '../domain/Election';
import { Option } from '../domain/Option';
import {
  assertElectionDates,
  assertElectionDescription,
  assertElectionOptions,
  assertElectionTitle,
  parseElectionStatus,
} from './election.validation';

export type CreateElectionDTO = {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: string;
  options: Array<{ title: string; description?: string }>;
};

export class CreateElectionUseCase {
  constructor(private readonly votacionRepository: VotacionRepository) {}

  async run(dto: CreateElectionDTO): Promise<Election> {
    const title = assertElectionTitle(dto.title);
    const description = assertElectionDescription(dto.description);
    const { startDate, endDate } = assertElectionDates(dto.startDate, dto.endDate);
    const status = parseElectionStatus(dto.status, 'DRAFT');
    const optionsInput = assertElectionOptions(dto.options);

    const electionId = crypto.randomUUID();
    const options = optionsInput.map(
      (option) => new Option(crypto.randomUUID(), electionId, option.title, option.description)
    );

    const election = new Election(electionId, title, description, startDate, endDate, status, options);

    return await this.votacionRepository.createElection(election);
  }
}
