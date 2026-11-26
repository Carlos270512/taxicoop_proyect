import { Archivo, Solicitud, SolicitudData, SolicitudEstado } from '../../domain/Solicitud';
import { SolicitudListResult, SolicitudRepository, SubmitSolicitudInput } from '../../domain/SolicitudRepository';
import { ArchivoModel } from '../models/Archivo.model';
import { SolicitudModel } from '../models/Solicitud.model';
import { SequelizeSocioRepository } from '../../../Socio/infrastructure/repositories/SequelizeSocioRepository';

const socioRepository = new SequelizeSocioRepository();

function toArchivo(row: ArchivoModel): Archivo {
  return {
    id: row.id,
    tipo: row.tipo,
    nombreOriginal: row.nombreOriginal,
    mimeType: row.mimeType,
    tamano: Number(row.tamano),
    createdAt: row.createdAt.toISOString(),
  };
}

async function toDomain(row: SolicitudModel): Promise<Solicitud> {
  const archivos = await ArchivoModel.findAll({ where: { solicitudId: row.id }, order: [['createdAt', 'ASC']] });
  let socioSalienteNombre: string | null = null;

  if (row.socioSalienteId) {
    const saliente = await socioRepository.findById(row.socioSalienteId);
    if (saliente) socioSalienteNombre = `${saliente.nombres} ${saliente.apellidos}`;
  }

  return {
    id: row.id,
    token: row.token,
    estado: row.estado,
    data: (row.datos ?? {}) as Partial<SolicitudData>,
    archivos: archivos.map(toArchivo),
    socioSalienteId: row.socioSalienteId,
    socioSalienteNombre,
    socioId: row.socioId,
    motivoRechazo: row.motivoRechazo,
    submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export class SequelizeSolicitudRepository implements SolicitudRepository {
  async create(solicitud: { token: string; socioSalienteId: string | null }): Promise<Solicitud> {
    const row = await SolicitudModel.create({
      token: solicitud.token,
      socioSalienteId: solicitud.socioSalienteId,
      estado: 'PENDIENTE',
      datos: {},
    });

    return toDomain(row);
  }

  async findAll(filters: { estado?: SolicitudEstado; page: number; limit: number }): Promise<SolicitudListResult> {
    const { rows, count } = await SolicitudModel.findAndCountAll({
      where: filters.estado ? { estado: filters.estado } : {},
      order: [['createdAt', 'DESC']],
      limit: filters.limit,
      offset: (filters.page - 1) * filters.limit,
    });

    return {
      items: await Promise.all(rows.map(toDomain)),
      total: count,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.max(1, Math.ceil(count / filters.limit)),
    };
  }

  async findById(id: string): Promise<Solicitud | null> {
    const row = await SolicitudModel.findByPk(id);
    return row ? toDomain(row) : null;
  }

  async findByToken(token: string): Promise<Solicitud | null> {
    const row = await SolicitudModel.findOne({ where: { token } });
    return row ? toDomain(row) : null;
  }

  async submit(id: string, input: SubmitSolicitudInput): Promise<Solicitud | null> {
    const row = await SolicitudModel.findByPk(id);
    if (!row) return null;

    await row.update({
      datos: input.data,
      passwordHash: input.passwordHash,
      submittedAt: new Date(),
      estado: 'PENDIENTE',
    });

    return toDomain(row);
  }

  async markApproved(id: string, socioId: string): Promise<Solicitud | null> {
    const row = await SolicitudModel.findByPk(id);
    if (!row) return null;

    await row.update({ estado: 'APROBADA', socioId, reviewedAt: new Date() });
    return toDomain(row);
  }

  async markRejected(id: string, motivo: string): Promise<Solicitud | null> {
    const row = await SolicitudModel.findByPk(id);
    if (!row) return null;

    await row.update({ estado: 'RECHAZADA', motivoRechazo: motivo, reviewedAt: new Date() });
    return toDomain(row);
  }

  async getPasswordHash(id: string): Promise<string | null> {
    const row = await SolicitudModel.findByPk(id, { attributes: ['passwordHash'] });
    return row?.passwordHash ?? null;
  }
}
