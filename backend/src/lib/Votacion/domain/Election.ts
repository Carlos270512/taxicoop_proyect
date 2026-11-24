import { Option } from './Option';

export type ElectionStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export const ELECTION_STATUSES: ElectionStatus[] = ['DRAFT', 'ACTIVE', 'CLOSED'];

export class Election {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly status: ElectionStatus,
    public readonly options: Option[] = [],
    public readonly votesCount: number = 0,
    public readonly hasVoted: boolean = false
  ) {}
}

export type ElectionOptionResult = {
  optionId: string;
  title: string;
  voteCount: number;
  percentage: number;
};

export type ElectionResults = {
  electionId: string;
  title: string;
  status: ElectionStatus;
  totalVotes: number;
  options: ElectionOptionResult[];
};
