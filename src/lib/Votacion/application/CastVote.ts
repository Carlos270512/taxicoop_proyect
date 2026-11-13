import { VotacionRepository } from '../domain/VotacionRepository';
import { Vote } from '../domain/Vote';
import crypto from 'crypto';

interface CastVoteDTO {
  electionId: string;
  optionId: string;
  userId: string;
}

export class CastVoteUseCase {
  constructor(private readonly votacionRepository: VotacionRepository) {}

  async run(dto: CastVoteDTO): Promise<Vote> {
    // 1. Verificar si la elección existe y está activa
    const election = await this.votacionRepository.findElectionById(dto.electionId);
    if (!election) {
      throw new Error('La elección especificada no existe.');
    }

    if (election.status !== 'ACTIVE') {
      throw new Error('La elección no se encuentra activa para emitir votos.');
    }

    // 2. Verificar si el usuario ya votó en esta elección 
    const alreadyVoted = await this.votacionRepository.hasUserVoted(dto.electionId, dto.userId);
    if (alreadyVoted) {
      throw new Error('Acción denegada: Ya has registrado tu voto en esta elección.');
    }

    // 3. Validar que la opción pertenezca a la elección
    const optionExists = election.options.some((opt) => opt.id === dto.optionId);
    if (!optionExists) {
      throw new Error('La opción de voto seleccionada no es válida para esta elección.');
    }

    // 4. Registrar el voto
    const vote = new Vote(
      crypto.randomUUID(),
      dto.electionId,
      dto.optionId,
      dto.userId
    );

    return await this.votacionRepository.saveVote(vote);
  }
}