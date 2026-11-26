import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';
import { AsistenciaRegistro, AsistenciaResumen } from '../../domain/Asistencia';
import { AsistenciaRepository } from '../../domain/AsistenciaRepository';
import { AsistenciaModel } from '../models/Asistencia.model';

export class SequelizeAsistenciaRepository implements AsistenciaRepository {
  async findByFecha(fecha: string): Promise<AsistenciaResumen> {
    const [rows] = await sequelize.query(
      `SELECT s.id AS "socioId",
              s."cedulaRuc" AS "cedulaRuc",
              s.nombres || ' ' || s.apellidos AS nombre,
              s.telefono,
              s.estado,
              (SELECT count(*) FROM unidades u WHERE u."socioId" = s.id)::int AS unidades,
              COALESCE(a.presente, false) AS presente,
              (a.id IS NOT NULL) AS marcada
         FROM socios s
         LEFT JOIN asistencias a ON a."socioId" = s.id AND a.fecha = :fecha
        WHERE s.estado <> 'RETIRADO'
        ORDER BY s.apellidos, s.nombres`,
      { replacements: { fecha } }
    );

    const registros = (rows as any[]).map((row) => ({
      socioId: row.socioId,
      cedulaRuc: row.cedulaRuc,
      nombre: row.nombre,
      telefono: row.telefono,
      estado: row.estado,
      unidades: Number(row.unidades),
      presente: Boolean(row.presente),
      marcada: Boolean(row.marcada),
    }));

    return this.buildResumen(fecha, registros);
  }

  async saveMany(
    fecha: string,
    registros: AsistenciaRegistro[],
    registradoPor: string | null
  ): Promise<AsistenciaResumen> {
    for (const registro of registros) {
      const [existing] = await AsistenciaModel.findAll({ where: { fecha, socioId: registro.socioId }, limit: 1 });

      if (existing) {
        await existing.update({ presente: registro.presente, registradoPor });
      } else {
        await AsistenciaModel.create({
          socioId: registro.socioId,
          fecha,
          presente: registro.presente,
          registradoPor,
        });
      }
    }

    return this.findByFecha(fecha);
  }

  async findUltimaFecha(): Promise<string | null> {
    const row = (await AsistenciaModel.findOne({
      attributes: ['fecha'],
      order: [['fecha', 'DESC']],
    })) as AsistenciaModel | null;

    return row?.fecha ?? null;
  }

  async findUltimaBySocioId(socioId: string): Promise<{ fecha: string; presente: boolean } | null> {
    const row = await AsistenciaModel.findOne({
      where: { socioId },
      order: [['fecha', 'DESC']],
    });

    return row ? { fecha: row.fecha, presente: Boolean(row.presente) } : null;
  }

  async countPresentesByFecha(fecha: string): Promise<number> {
    return AsistenciaModel.count({ where: { fecha, presente: true } });
  }

  private buildResumen(fecha: string, registros: AsistenciaResumen['registros']): AsistenciaResumen {    const presentes = registros.filter((registro) => registro.marcada && registro.presente).length;
    const sinRegistrar = registros.filter((registro) => !registro.marcada).length;

    return {
      fecha,
      total: registros.length,
      presentes,
      ausentes: registros.length - presentes - sinRegistrar,
      sinRegistrar,
      registros,
    };
  }
}
