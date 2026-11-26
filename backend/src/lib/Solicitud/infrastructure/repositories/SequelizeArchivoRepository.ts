import { Archivo, ArchivoTipo } from '../../domain/Solicitud';
import { ArchivoRepository } from '../../domain/SolicitudRepository';
import { ArchivoModel } from '../models/Archivo.model';

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

export class SequelizeArchivoRepository implements ArchivoRepository {
  async save(data: {
    solicitudId: string;
    socioId?: string | null;
    tipo: ArchivoTipo;
    nombreOriginal: string;
    mimeType: string;
    tamano: number;
    ruta: string;
  }): Promise<Archivo> {
    const row = await ArchivoModel.create({
      solicitudId: data.solicitudId,
      socioId: data.socioId ?? null,
      tipo: data.tipo,
      nombreOriginal: data.nombreOriginal,
      mimeType: data.mimeType,
      tamano: data.tamano,
      ruta: data.ruta,
    });

    return toArchivo(row);
  }

  async findById(id: string): Promise<{ archivo: Archivo; ruta: string } | null> {
    const row = await ArchivoModel.findByPk(id);
    if (!row) return null;
    return { archivo: toArchivo(row), ruta: row.ruta };
  }

  async attachToSocio(archivoIds: string[], socioId: string): Promise<void> {
    if (archivoIds.length === 0) return;
    await ArchivoModel.update({ socioId }, { where: { id: archivoIds } });
  }
}
