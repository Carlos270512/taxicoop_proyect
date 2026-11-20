import { UserAuth } from './UserAuth';
import { Role } from './Role';

export interface AuthRepository {
  saveUser(user: UserAuth): Promise<UserAuth>;
  findByEmail(email: string): Promise<UserAuth | null>;
  saveRole(role: Role): Promise<Role>;
  findAllRoles(): Promise<Role[]>;
}