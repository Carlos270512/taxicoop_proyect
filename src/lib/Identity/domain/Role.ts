export class Role {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly descripcion?: string
  ) {}
}