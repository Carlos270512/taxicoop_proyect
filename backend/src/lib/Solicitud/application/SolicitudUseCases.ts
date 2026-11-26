import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { HttpError } from '../../Shared/domain/HttpError';
import { Socio } from '../../Socio/domain/Socio';
import { SocioRepository } from '../../Socio/domain/SocioRepository';
import { Unidad } from '../../Unidad/domain/Unidad';
import { UnidadRepository } from '../../Unidad/domain/UnidadRepository';
import { Solicitud } from '../domain/Solicitud';
import { ArchivoRepository, SolicitudRepository } from '../domain/SolicitudRepository';
import { parseSolicitudForm, SolicitudFormInput } from './solicitud.validation';

export type PaginationInput = { estado?: string; page?: unknown; limit?: unknown };

/** Genera el enlace externo de postulación (solo administración). */
export class CreateSolicitudUseCase {
  constructor(
    private readonly solicitudRepository: SolicitudRepository,
    private readonly socioRepository: SocioRepository
  ) {}

  async run(socioSalienteId?: unknown): Promise<Solicitud> {
    let saliente: string | null = null;

    if (socioSalienteId) {
      const socio = await this.socioRepository.findById(String(socioSalienteId));
      if (!socio) throw new HttpError(400, 'El socio saliente indicado no existe.');
      saliente = socio.id;
    }

    return this.solicitudRepository.create({
      token: crypto.randomBytes(24).toString('hex'),
      socioSalienteId: saliente,
    });
  }
}

export class GetSolicitudesUseCase {
  constructor(private readonly solicitudRepository: SolicitudRepository) {}

  run(input: PaginationInput) {
    const page = Math.max(1, Number(input.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(input.limit) || 20));
    const estado = ['PENDIENTE', 'APROBADA', 'RECHAZADA'].includes(String(input.estado).toUpperCase())
      ? (String(input.estado).toUpperCase() as Solicitud['estado'])
      : undefined;

    return this.solicitudRepository.findAll({ estado, page, limit });
  }
}

export class GetSolicitudByIdUseCase {
  constructor(private readonly solicitudRepository: SolicitudRepository) {}

  async run(id: string): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.findById(id);
    if (!solicitud) throw new HttpError(404, 'Postulación no encontrada.');
    return solicitud;
  }
}

export class GetPublicSolicitudUseCase {
  constructor(private readonly solicitudRepository: SolicitudRepository) {}

  async run(token: string): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.findByToken(token);
    if (!solicitud) throw new HttpError(404, 'El enlace de postulación no es válido.');
    return solicitud;
  }
}

/** El postulante envía el formulario desde el enlace externo. */
export class SubmitSolicitudUseCase {
  constructor(private readonly solicitudRepository: SolicitudRepository) {}

  async run(token: string, input: SolicitudFormInput): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.findByToken(token);
    if (!solicitud) throw new HttpError(404, 'El enlace de postulación no es válido.');
    if (solicitud.estado === 'APROBADA') throw new HttpError(409, 'Esta postulación ya fue aprobada.');
    if (solicitud.estado === 'RECHAZADA') throw new HttpError(409, 'Esta postulación fue rechazada.');

    const parsed = parseSolicitudForm(input);

    if (!parsed.password) {
      throw new HttpError(400, 'La contraseña es obligatoria (mínimo 8 caracteres).');
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const updated = await this.solicitudRepository.submit(solicitud.id, {
      data: parsed.data,
      passwordHash,
    });

    if (!updated) throw new HttpError(404, 'Postulación no encontrada.');
    return updated;
  }
}

/** Aprueba la postulación: crea el usuario, el socio y su unidad. */
export class ApproveSolicitudUseCase {
  constructor(
    private readonly solicitudRepository: SolicitudRepository,
    private readonly archivoRepository: ArchivoRepository,
    private readonly socioRepository: SocioRepository,
    private readonly unidadRepository: UnidadRepository
  ) {}

  async run(id: string): Promise<{ solicitud: Solicitud; socioId: string }> {
    const solicitud = await this.solicitudRepository.findById(id);
    if (!solicitud) throw new HttpError(404, 'Postulación no encontrada.');
    if (solicitud.estado === 'APROBADA') throw new HttpError(409, 'Esta postulación ya fue aprobada.');
    if (!solicitud.submittedAt || !solicitud.data.cedulaRuc) {
      throw new HttpError(409, 'El postulante todavía no completó el formulario.');
    }

    const passwordHash = await this.solicitudRepository.getPasswordHash(id);
    if (!passwordHash) throw new HttpError(409, 'La postulación no tiene contraseña registrada.');

    const data = solicitud.data;
    const cedula = String(data.cedulaRuc);

    if (await this.socioRepository.findByCedula(cedula)) {
      throw new HttpError(409, 'Ya existe un socio con esa cédula/RUC.');
    }
    if (data.email && (await this.socioRepository.existsEmail(String(data.email)))) {
      throw new HttpError(409, 'Ya existe un usuario con ese correo electrónico.');
    }

    const socio = new Socio(
      crypto.randomUUID(),
      crypto.randomUUID(),
      cedula,
      String(data.nombres ?? ''),
      String(data.apellidos ?? ''),
      String(data.telefono ?? ''),
      'ACTIVO',
      String(data.email ?? ''),
      0
    );

    await this.socioRepository.createWithUser(socio, String(data.email ?? ''), passwordHash, ['SOCIO'], {
      direccion: String(data.direccion ?? ''),
      solicitudId: solicitud.id,
      socioSalienteId: solicitud.socioSalienteId,
    });

    const unidad = new Unidad(
      crypto.randomUUID(),
      String(data.numeroUnidad ?? ''),
      String(data.placa ?? ''),
      Number(data.anioVehiculo),
      socio.id,
      'OPERATIVA'
    );

    const matricula = solicitud.archivos.find((archivo) => archivo.tipo === 'MATRICULA');

    await this.unidadRepository.save(unidad, {
      fechaExpiracion: data.fechaExpiracion ? new Date(String(data.fechaExpiracion)) : null,
      matriculaArchivoId: matricula?.id ?? null,
    });

    await this.archivoRepository.attachToSocio(
      solicitud.archivos.map((archivo) => archivo.id),
      socio.id
    );

    const updated = await this.solicitudRepository.markApproved(id, socio.id);
    return { solicitud: updated ?? solicitud, socioId: socio.id };
  }
}

export class RejectSolicitudUseCase {
  constructor(private readonly solicitudRepository: SolicitudRepository) {}

  async run(id: string, motivo: unknown): Promise<Solicitud> {
    const { assertMotivo } = await import('./solicitud.validation');
    const solicitud = await this.solicitudRepository.findById(id);

    if (!solicitud) throw new HttpError(404, 'Postulación no encontrada.');
    if (solicitud.estado === 'APROBADA') throw new HttpError(409, 'No se puede rechazar una postulación aprobada.');

    const updated = await this.solicitudRepository.markRejected(id, assertMotivo(motivo));
    if (!updated) throw new HttpError(404, 'Postulación no encontrada.');
    return updated;
  }
}
