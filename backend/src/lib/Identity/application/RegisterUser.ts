import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AuthRepository } from '../domain/AuthRepository';
import { UserAuth } from '../domain/UserAuth';

export class RegisterUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async run(dto: any) {
    const plainPassword = dto.password || dto.passwordPlain || dto.passwordHash;

    if (!plainPassword) {
      throw new Error('La contraseña es obligatoria.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(String(plainPassword), saltRounds);

    const allRoles = await this.authRepository.findAllRoles();
    const targetRoles = dto.roles && dto.roles.length > 0 ? dto.roles : ['SOCIO'];
    const assignedRoles = allRoles.filter((role) => targetRoles.includes(role.nombre));

    const newUser = new UserAuth(
      crypto.randomUUID(),
      dto.email,
      passwordHash,
      assignedRoles
    );

    return await this.authRepository.saveUser(newUser);
  }
}