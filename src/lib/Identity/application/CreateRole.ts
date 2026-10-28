import { AuthRepository } from '../domain/AuthRepository';
import { Role } from '../domain/Role';
import { v4 as uuidv4 } from 'uuid';

export class CreateRoleUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async run(data: { nombre: string; descripcion?: string }): Promise<Role> {
    const role = new Role(uuidv4(), data.nombre, data.descripcion);
    return await this.authRepository.saveRole(role);
  }
}