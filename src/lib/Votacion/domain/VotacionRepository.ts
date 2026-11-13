import { Election } from './Election';
import { Vote } from './Vote';

export interface VotacionRepository {
  createElection(election: Election): Promise<Election>;
  findElectionById(id: string): Promise<Election | null>;
  findActiveElections(): Promise<Election[]>;
  saveVote(vote: Vote): Promise<Vote>;
  hasUserVoted(electionId: string, userId: string): Promise<boolean>;
  getResults(electionId: string): Promise<Array<{ optionId: string; title: string; voteCount: number }>>;
}