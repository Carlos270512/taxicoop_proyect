import crypto from 'crypto';
import { VotacionRepository } from '../domain/VotacionRepository';
import { Vote } from '../domain/Vote';
import { HttpError } from '../../Shared/domain/HttpError';

export type CastVoteDTO = {
  electionId: string;
  optionId: string;
  userId: string;
};

export class CastVoteUseCase {
  constructor(private readonly votacionRepository: VotacionRepository) {}

  async run(dto: CastVoteDTO): Promise<Vote> {
    const electionId = String(dto.electionId ?? '').trim();
    const optionId = String(dto.optionId ?? '').trim();
    const userId = String(dto.userId ?? '').trim();

    if (!electionId || !optionId || !userId) {
      throw new HttpError(400, 'La elección y la opción son obligatorias.');
    }

    const election = await this.votacionRepository.findElectionById(electionId);
    if (!election) {
      throw new HttpError(404, 'La elección especificada no existe.');
    }

    if (election.status !== 'ACTIVE') {
      throw new HttpError(409, 'La elección no está activa para votar.');
    }

    const now = new Date();
    if (now < election.startDate) {
      throw new HttpError(409, 'La votación aún no ha comenzado.');
    }
    if (now > election.endDate) {
      throw new HttpError(409, 'La votación ya finalizó.');
    }

    if (await this.votacionRepository.hasUserVoted(electionId, userId)) {
      throw new HttpError(409, 'Ya has registrado tu voto en esta elección.');
    }

    if (!election.options.some((option) => option.id === optionId)) {
      throw new HttpError(400, 'La opción de voto seleccionada no es válida para esta elección.');
    }

    const vote = new Vote(crypto.randomUUID(), electionId, optionId, userId);

    return await this.votacionRepository.saveVote(vote);
  }
}
