import { AuthRepository } from '../domain/AuthRepository';
import { UserAuth } from '../domain/UserAuth';
import { v4 as uuidv4 } from 'uuid';

export class RegisterUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async run(data: { email: string; passwordHash: string; roles: string[] }): Promise<UserAuth> {

    const allRoles = await this.authRepository.findAllRoles();
    const assignedRoles = allRoles.filter(role => data.roles.includes(role.nombre));

    const user = new UserAuth(
      uuidv4(),
      data.email,
      data.passwordHash,
      assignedRoles
    );

    return await this.authRepository.saveUser(user);
  }
}