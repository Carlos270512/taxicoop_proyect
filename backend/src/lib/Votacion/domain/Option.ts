export class Option {
  public id: string;
  public electionId: string;
  public title: string;
  public description: string;

  constructor(id: string, electionId: string, title: string, description: string) {
    this.id = id;
    this.electionId = electionId;
    this.title = title;
    this.description = description;
  }
}