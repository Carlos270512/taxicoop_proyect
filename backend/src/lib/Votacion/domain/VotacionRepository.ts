import { Election, ElectionResults, ElectionStatus } from './Election';
import { Vote } from './Vote';

export type ElectionFilters = {
  status?: ElectionStatus;
  page: number;
  limit: number;
};

export type ElectionListResult = {
  items: Election[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export interface VotacionRepository {
  createElection(election: Election): Promise<Election>;
  findElectionById(id: string, userId?: string): Promise<Election | null>;
  findAll(filters: ElectionFilters): Promise<ElectionListResult>;
  findActiveElections(): Promise<Election[]>;
  updateStatus(id: string, status: ElectionStatus): Promise<Election | null>;
  saveVote(vote: Vote): Promise<Vote>;
  hasUserVoted(electionId: string, userId: string): Promise<boolean>;
  getResults(electionId: string): Promise<ElectionResults | null>;
}
