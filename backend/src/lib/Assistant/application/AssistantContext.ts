import { DashboardRepository } from '../../Dashboard/domain/DashboardRepository';
import { SocioRepository } from '../../Socio/domain/SocioRepository';
import { UnidadRepository } from '../../Unidad/domain/UnidadRepository';
import { VotacionRepository } from '../../Votacion/domain/VotacionRepository';

export type AssistantContextInput = {
  userId: string;
  roles: string[];
};

const MAX_VOTACIONES = 5;

/** Arma el bloque de contexto real que se le inyecta al modelo, segun el rol. */
export class AssistantContextBuilder {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly socioRepository: SocioRepository,
    private readonly unidadRepository: UnidadRepository,
    private readonly votacionRepository: VotacionRepository
  ) {}

  async build({ userId, roles }: AssistantContextInput): Promise<string> {
    try {
      return roles.includes('ADMIN') ? await this.buildAdminContext() : await this.buildSocioContext(userId);
    } catch {
      return '- No se pudieron consultar los datos del sistema en este momento.';
    }
  }

  private async buildAdminContext(): Promise<string> {
    const [counters, activity] = await Promise.all([
      this.dashboardRepository.getCounters(),
      this.dashboardRepository.getRecentActivity(3),
    ]);

    const lines = [
      `- Socios: ${counters.socios.total} registrados, ${counters.socios.activos} activos.`,
      `- Unidades: ${counters.unidades.total} registradas, ${counters.unidades.operativas} operativas.`,
      `- Alertas de emergencia: ${counters.emergencias.total} en total, ${counters.emergencias.pendientes} pendientes.`,
      `- Votaciones: ${counters.votacion.total} en total, ${counters.votacion.activas} activas.`,
    ];

    if (activity.length > 0) {
      lines.push('- Actividad reciente:');
      for (const item of activity) {
        lines.push(`  - ${item.title} (${item.subtitle}).`);
      }
    }

    return lines.join('\n');
  }

  private async buildSocioContext(userId: string): Promise<string> {
    const socio = await this.socioRepository.findByUserId(userId);

    if (!socio) {
      return '- El usuario no tiene un perfil de socio asociado.';
    }

    const unidades = await this.unidadRepository.findAll({ socioId: socio.id, page: 1, limit: 10 });
    const lines = [
      `- Socio autenticado: ${socio.nombres} ${socio.apellidos} (cédula/RUC ${socio.cedulaRuc}), estado ${socio.estado}.`,
      `- Unidades del socio: ${unidades.total}.`,
    ];

    for (const unidad of unidades.items) {
      lines.push(
        `  - Unidad ${unidad.numeroUnidad}, placa ${unidad.placa}, año ${unidad.anioVehiculo}, estado ${unidad.estado}.`
      );
    }

    const activas = await this.votacionRepository.findActiveElections();

    if (activas.length === 0) {
      lines.push('- No hay votaciones abiertas ahora mismo.');
    } else {
      lines.push(`- Votaciones abiertas: ${activas.length}.`);
      for (const election of activas.slice(0, MAX_VOTACIONES)) {
        const voto = await this.votacionRepository.hasUserVoted(election.id, userId);
        lines.push(`  - "${election.title}": ${voto ? 'ya votó' : 'pendiente de votar'}.`);
      }
    }

    return lines.join('\n');
  }
}
