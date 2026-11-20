import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../domain/AuthRepository';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

export class LoginUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async run(email: string, passwordPlain: string): Promise<LoginResponse> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas (usuario no encontrado).');
    }

    let isPasswordValid = false;
    if (user.passwordHash.startsWith('$2b$') || user.passwordHash.startsWith('$2a$')) {
      isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    } else {
      isPasswordValid = passwordPlain === user.passwordHash;
    }

    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas (contraseña incorrecta).');
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_taxicoop';
    const rolesNames = user.roles ? user.roles.map((r) => r.nombre) : [];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roles: rolesNames,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        roles: rolesNames,
      },
    };
  }
}