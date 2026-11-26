import { NuevaUbicacion, Ubicacion } from '../../domain/Ubicacion';
import { UbicacionRepository } from '../../domain/UbicacionRepository';
import { UbicacionModel } from '../models/Ubicacion.model';

function toDomain(row: UbicacionModel): Ubicacion {
  return {
    id: row.id,
    socioId: row.socioId,
    latitud: Number(row.latitud),
    longitud: Number(row.longitud),
    precisionMetros: row.precisionMetros === null ? null : Number(row.precisionMetros),
    capturedAt: row.capturedAt,
  };
}

export class SequelizeUbicacionRepository implements UbicacionRepository {
  async save(data: NuevaUbicacion): Promise<Ubicacion> {
    const row = await UbicacionModel.create({
      socioId: data.socioId,
      latitud: data.latitud,
      longitud: data.longitud,
      precisionMetros: data.precisionMetros ?? null,
      capturedAt: data.capturedAt,
    });

    return toDomain(row);
  }

  async findLatestBySocioId(socioId: string): Promise<Ubicacion | null> {
    const row = await UbicacionModel.findOne({
      where: { socioId },
      order: [['capturedAt', 'DESC']],
    });

    return row ? toDomain(row) : null;
  }

  async findHistoryBySocioId(socioId: string, limit: number): Promise<Ubicacion[]> {
    const rows = await UbicacionModel.findAll({
      where: { socioId },
      order: [['capturedAt', 'DESC']],
      limit,
    });

    return rows.map(toDomain);
  }
}
