import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { SocioRepository } from '../domain/SocioRepository';
import { Socio } from '../domain/Socio';
import { HttpError } from '../../Shared/domain/HttpError';
import { assertCedula, assertEmail, assertName, assertPassword, assertTelefono, parseEstado } from './socio.validation';

export type CreateSocioDTO = {
  cedulaRuc: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  password: string;
  roles?: string[];
  estado?: string;
};

export class CreateSocioUseCase {
  constructor(private readonly socioRepository: SocioRepository) {}

  async run(dto: CreateSocioDTO): Promise<Socio> {
    const cedulaRuc = assertCedula(dto.cedulaRuc);
    const nombres = assertName(dto.nombres, 'nombres');
    const apellidos = assertName(dto.apellidos, 'apellidos');
    const telefono = assertTelefono(dto.telefono);
    const email = assertEmail(dto.email);
    const password = assertPassword(dto.password);
    const estado = parseEstado(dto.estado, 'ACTIVO');

    if (await this.socioRepository.findByCedula(cedulaRuc)) {
      throw new HttpError(409, 'Ya existe un socio registrado con esa cédula/RUC.');
    }

    if (await this.socioRepository.existsEmail(email)) {
      throw new HttpError(409, 'Ya existe un usuario registrado con ese correo.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const roles = dto.roles && dto.roles.length > 0 ? dto.roles : ['SOCIO'];

    // Un socio siempre tiene un usuario de acceso asociado (user_id es obligatorio y unico)
    const socio = new Socio(
      crypto.randomUUID(),
      crypto.randomUUID(),
      cedulaRuc,
      nombres,
      apellidos,
      telefono,
      estado,
      email
    );

    return await this.socioRepository.createWithUser(socio, email, passwordHash, roles);
  }
}