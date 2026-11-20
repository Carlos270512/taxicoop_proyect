import { Option } from './Option';

export type ElectionStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export class Election {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly status: ElectionStatus,
    public readonly options: Option[] = []
  ) {}
}