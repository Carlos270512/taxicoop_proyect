export type ElectionStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export const ELECTION_STATUSES: ElectionStatus[] = ['DRAFT', 'ACTIVE', 'CLOSED'];

export type ElectionOption = {
  id: string;
  electionId: string;
  title: string;
  description: string;
};

export type Election = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ElectionStatus;
  options: ElectionOption[];
  votesCount: number;
  hasVoted: boolean;
};

export type ElectionFilters = {
  status: ElectionStatus | '';
  page: number;
  limit: number;
};

export type CreateElectionInput = {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  options: Array<{ title: string; description?: string }>;
};

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

export type ElectionFormValues = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  options: string[];
};

export const EMPTY_ELECTION_FILTERS: ElectionFilters = {
  status: '',
  page: 1,
  limit: 10,
};

export const EMPTY_ELECTION_FORM: ElectionFormValues = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  options: ['', ''],
};
