import { DashboardCounters, RecentActivityItem } from '../../domain/DashboardSummary';
import { DashboardRepository } from '../../domain/DashboardRepository';
import { SocioModel } from '../../../Socio/infrastructure/models/Socio.model';
import { UnidadModel } from '../../../Unidad/infrastructure/models/Unidad.model';
import { ElectionModel } from '../../../Votacion/infrastructure/models/Election.model';
import { EmergencyAlertModel } from '../../../Emergencia/infrastructure/models/EmergencyAlert.model';

type PlainRecord = Record<string, any>;

export class MixedDashboardRepository implements DashboardRepository {
  async getCounters(): Promise<DashboardCounters> {
    const [
      sociosTotal,
      sociosActivos,
      unidadesTotal,
      unidadesOperativas,
      votacionTotal,
      votacionActivas,
      emergenciasTotal,
      emergenciasPendientes,
    ] = await Promise.all([
      SocioModel.count(),
      SocioModel.count({ where: { estado: 'ACTIVO' } }),
      UnidadModel.count(),
      UnidadModel.count({ where: { estado: 'OPERATIVA' } }),
      ElectionModel.count(),
      ElectionModel.count({ where: { status: 'ACTIVE' } }),
      EmergencyAlertModel.countDocuments(),
      EmergencyAlertModel.countDocuments({ estado: 'PENDIENTE' }),
    ]);

    return {
      socios: { total: sociosTotal, activos: sociosActivos },
      unidades: { total: unidadesTotal, operativas: unidadesOperativas },
      emergencias: { total: emergenciasTotal, pendientes: emergenciasPendientes },
      votacion: { total: votacionTotal, activas: votacionActivas },
    };
  }

  async getRecentActivity(limit: number): Promise<RecentActivityItem[]> {
    const [socios, unidades, elecciones, emergencias] = await Promise.all([
      SocioModel.findAll({ order: [['createdAt', 'DESC']], limit: 5 }),
      UnidadModel.findAll({ order: [['createdAt', 'DESC']], limit: 5 }),
      ElectionModel.findAll({ order: [['createdAt', 'DESC']], limit: 5 }),
      EmergencyAlertModel.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const items: RecentActivityItem[] = [
      ...socios.map((model) => {
        const row = model.get({ plain: true }) as PlainRecord;
        return {
          id: String(row.id),
          type: 'SOCIO' as const,
          title: `${row.nombres} ${row.apellidos}`,
          subtitle: `Socio · ${row.cedulaRuc}`,
          createdAt: new Date(row.createdAt).toISOString(),
        };
      }),
      ...unidades.map((model) => {
        const row = model.get({ plain: true }) as PlainRecord;
        return {
          id: String(row.id),
          type: 'UNIDAD' as const,
          title: `Unidad ${row.numeroUnidad}`,
          subtitle: `Placa ${row.placa}`,
          createdAt: new Date(row.createdAt).toISOString(),
        };
      }),
      ...elecciones.map((model) => {
        const row = model.get({ plain: true }) as PlainRecord;
        return {
          id: String(row.id),
          type: 'VOTACION' as const,
          title: String(row.title),
          subtitle: `Votación ${row.status}`,
          createdAt: new Date(row.createdAt).toISOString(),
        };
      }),
      ...emergencias.map((row: PlainRecord) => ({
        id: String(row._id),
        type: 'EMERGENCIA' as const,
        title: `Alerta · Unidad ${row.numeroUnidad}`,
        subtitle: `Emergencia ${row.estado}`,
        createdAt: new Date(row.createdAt).toISOString(),
      })),
    ];

    return items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}
