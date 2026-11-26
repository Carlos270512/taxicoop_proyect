import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';
import { AsistenciaFila, MiReunion, Reunion, ReunionDetalle } from '../../domain/Reunion';
import { NuevaReunion, ReunionListResult, ReunionRepository } from '../../domain/ReunionRepository';
import { AsistenciaModel } from '../../../Asistencia/infrastructure/models/Asistencia.model';
import { ReunionModel } from '../models/Reunion.model';

const REUNION_SELECT = `
  SELECT r.id, r.titulo, r.descripcion, r.fecha, r."eleccionId", r."createdAt",
         e.title AS "eleccionTitulo", e.status AS "eleccionEstado",
         (SELECT count(*) FROM socios s WHERE s.estado <> 'RETIRADO')::int AS "totalSocios",
         (SELECT count(*) FROM asistencias a WHERE a."reunionId" = r.id AND a.presente)::int AS presentes
    FROM reuniones r
    LEFT JOIN elections e ON e.id = r."eleccionId"
`;

function toReunion(row: any): Reunion {
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion ?? null,
    fecha: row.fecha,
    eleccionId: row.eleccionId ?? null,
    eleccionTitulo: row.eleccionTitulo ?? null,
    eleccionEstado: row.eleccionEstado ?? null,
    totalSocios: Number(row.totalSocios ?? 0),
    presentes: Number(row.presentes ?? 0),
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

export class SequelizeReunionRepository implements ReunionRepository {
  async findAll(filters: { page: number; limit: number }): Promise<ReunionListResult> {
    const [rows] = await sequelize.query(
      `${REUNION_SELECT} ORDER BY r.fecha DESC, r."createdAt" DESC LIMIT :limit OFFSET :offset`,
      { replacements: { limit: filters.limit, offset: (filters.page - 1) * filters.limit } }
    );

    const [[countRow]] = await sequelize.query('SELECT count(*)::int AS total FROM reuniones');
    const total = Number((countRow as any)?.total ?? 0);

    return {
      items: (rows as any[]).map(toReunion),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
    };
  }

  async findById(id: string): Promise<ReunionDetalle | null> {
    const [rows] = await sequelize.query(`${REUNION_SELECT} WHERE r.id = :id`, { replacements: { id } });
    const row = (rows as any[])[0];
    if (!row) return null;

    const [registros] = await sequelize.query(
      `SELECT s.id AS "socioId",
              s."cedulaRuc" AS "cedulaRuc",
              s.nombres || ' ' || s.apellidos AS nombre,
              s.telefono,
              s.estado,
              (SELECT count(*) FROM unidades u WHERE u."socioId" = s.id)::int AS unidades,
              COALESCE(a.presente, false) AS presente,
              (a.id IS NOT NULL) AS marcada
         FROM socios s
         LEFT JOIN asistencias a ON a."socioId" = s.id AND a."reunionId" = :id
        WHERE s.estado <> 'RETIRADO'
        ORDER BY s.apellidos, s.nombres`,
      { replacements: { id } }
    );

    return { ...toReunion(row), registros: (registros as any[]).map(this.toFila) };
  }

  async create(data: NuevaReunion): Promise<Reunion> {
    const row = await ReunionModel.create({
      titulo: data.titulo,
      descripcion: data.descripcion ?? null,
      fecha: data.fecha,
      eleccionId: data.eleccionId ?? null,
      creadaPor: data.creadaPor ?? null,
    });

    const created = await this.findById(row.id);
    if (created) return created;

    return toReunion({ ...row.get({ plain: true }), totalSocios: 0, presentes: 0 });
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await ReunionModel.destroy({ where: { id } });
    return deleted > 0;
  }

  async saveAsistencia(
    reunionId: string,
    fecha: string,
    registros: Array<{ socioId: string; presente: boolean }>,
    userId: string | null
  ): Promise<ReunionDetalle> {
    for (const registro of registros) {
      const existing = await AsistenciaModel.findOne({ where: { reunionId, socioId: registro.socioId } });

      if (existing) {
        await existing.update({ presente: registro.presente, registradoPor: userId });
      } else {
        await AsistenciaModel.create({
          socioId: registro.socioId,
          reunionId,
          fecha,
          presente: registro.presente,
          registradoPor: userId,
        });
      }
    }

    const detalle = await this.findById(reunionId);
    if (!detalle) throw new Error('Reunión no encontrada.');
    return detalle;
  }

  async findMiasBySocioId(socioId: string, userId: string): Promise<MiReunion[]> {
    const [rows] = await sequelize.query(
      `SELECT r.id, r.titulo, r.descripcion, r.fecha, r."eleccionId",
              e.title AS "eleccionTitulo", e.status AS "eleccionEstado",
              a.presente,
              CASE WHEN a.id IS NULL THEN 'SIN_REGISTRAR' WHEN a.presente THEN 'PRESENTE' ELSE 'AUSENTE' END AS asistencia,
              EXISTS (SELECT 1 FROM votes v WHERE v."electionId" = r."eleccionId" AND v."userId" = :userId) AS "yaVoto"
         FROM reuniones r
         LEFT JOIN elections e ON e.id = r."eleccionId"
         LEFT JOIN asistencias a ON a."reunionId" = r.id AND a."socioId" = :socioId
        ORDER BY r.fecha DESC, r."createdAt" DESC
        LIMIT 60`,
      { replacements: { socioId, userId } }
    );

    return (rows as any[]).map((row) => ({
      id: row.id,
      titulo: row.titulo,
      descripcion: row.descripcion ?? null,
      fecha: row.fecha,
      asistencia: row.asistencia,
      eleccionId: row.eleccionId ?? null,
      eleccionTitulo: row.eleccionTitulo ?? null,
      eleccionEstado: row.eleccionEstado ?? null,
      yaVoto: Boolean(row.yaVoto),
    }));
  }

  async findUltima(): Promise<{ reunion: Reunion; presentes: number } | null> {
    const [rows] = await sequelize.query(`${REUNION_SELECT} ORDER BY r.fecha DESC, r."createdAt" DESC LIMIT 1`);
    const row = (rows as any[])[0];
    if (!row) return null;

    const reunion = toReunion(row);
    return { reunion, presentes: reunion.presentes };
  }

  async findUltimaBySocioId(socioId: string): Promise<{ fecha: string; titulo: string; presente: boolean } | null> {
    const [rows] = await sequelize.query(
      `SELECT r.fecha, r.titulo, COALESCE(a.presente, false) AS presente
         FROM reuniones r
         LEFT JOIN asistencias a ON a."reunionId" = r.id AND a."socioId" = :socioId
        ORDER BY r.fecha DESC, r."createdAt" DESC
        LIMIT 1`,
      { replacements: { socioId } }
    );

    const row = (rows as any[])[0];
    return row ? { fecha: row.fecha, titulo: row.titulo, presente: Boolean(row.presente) } : null;
  }

  private toFila(row: any): AsistenciaFila {
    return {
      socioId: row.socioId,
      cedulaRuc: row.cedulaRuc,
      nombre: row.nombre,
      telefono: row.telefono,
      estado: row.estado,
      unidades: Number(row.unidades ?? 0),
      presente: Boolean(row.presente),
      marcada: Boolean(row.marcada),
    };
  }
}
