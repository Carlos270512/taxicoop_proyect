import { Role } from './Role';

export class UserAuth {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly roles: Role[] = []
  ) {}
}