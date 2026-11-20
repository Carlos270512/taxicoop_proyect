export class Vote {
  constructor(
    public readonly id: string,
    public readonly electionId: string,
    public readonly optionId: string,
    public readonly userId: string,
    public readonly createdAt: Date = new Date()
  ) {}
}