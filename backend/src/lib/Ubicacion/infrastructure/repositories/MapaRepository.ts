import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';

export type TaxiEnMapa = {
  socioId: string;
  socioNombre: string;
  socioEstado: string;
  numeroUnidad: string | null;
  placa: string | null;
  unidadEstado: string | null;
  latitud: number;
  longitud: number;
  precisionMetros: number | null;
  capturedAt: string;
};

/** Última ubicación de cada socio activo, con su unidad principal. */
export class MapaRepository {
  async findTaxis(): Promise<TaxiEnMapa[]> {
    const [rows] = await sequelize.query(
      `SELECT s.id AS "socioId",
              s.nombres || ' ' || s.apellidos AS "socioNombre",
              s.estado AS "socioEstado",
              u."numeroUnidad", u.placa, u.estado AS "unidadEstado",
              l.latitud, l.longitud, l."precisionMetros", l."capturedAt"
         FROM socios s
         JOIN LATERAL (
              SELECT ub.latitud, ub.longitud, ub."precisionMetros", ub."capturedAt"
                FROM ubicaciones_socio ub
               WHERE ub."socioId" = s.id
               ORDER BY ub."capturedAt" DESC
               LIMIT 1
         ) l ON TRUE
         LEFT JOIN LATERAL (
              SELECT un."numeroUnidad", un.placa, un.estado
                FROM unidades un
               WHERE un."socioId" = s.id
               ORDER BY un."createdAt" ASC
               LIMIT 1
         ) u ON TRUE
        WHERE s.estado <> 'RETIRADO'
        ORDER BY l."capturedAt" DESC`
    );

    return (rows as any[]).map((row) => ({
      socioId: row.socioId,
      socioNombre: row.socioNombre,
      socioEstado: row.socioEstado,
      numeroUnidad: row.numeroUnidad ?? null,
      placa: row.placa ?? null,
      unidadEstado: row.unidadEstado ?? null,
      latitud: Number(row.latitud),
      longitud: Number(row.longitud),
      precisionMetros: row.precisionMetros === null ? null : Number(row.precisionMetros),
      capturedAt: new Date(row.capturedAt).toISOString(),
    }));
  }
}
