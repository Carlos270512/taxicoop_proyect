import { DashboardRepository } from '../../Dashboard/domain/DashboardRepository';
import { SocioRepository } from '../../Socio/domain/SocioRepository';
import { UnidadRepository } from '../../Unidad/domain/UnidadRepository';
import { VotacionRepository } from '../../Votacion/domain/VotacionRepository';
import { AsistenciaRepository } from '../../Asistencia/domain/AsistenciaRepository';
import { MapaRepository } from '../../Ubicacion/infrastructure/repositories/MapaRepository';

export type AssistantContextInput = {
  userId: string;
  roles: string[];
};

const MAX_VOTACIONES = 5;
const MAX_SOCIOS = 20;

function mapsLink(latitud: number, longitud: number): string {
  return `https://www.google.com/maps?q=${latitud},${longitud}`;
}

/** Arma el bloque de contexto real que se le inyecta al modelo, segun el rol. */
export class AssistantContextBuilder {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly socioRepository: SocioRepository,
    private readonly unidadRepository: UnidadRepository,
    private readonly votacionRepository: VotacionRepository,
    private readonly asistenciaRepository: AsistenciaRepository,
    private readonly mapaRepository: MapaRepository
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
      for (const item of activity) lines.push(`  - ${item.title} (${item.subtitle}).`);
    }

    lines.push(...(await this.mapLines()));
    lines.push(...(await this.sociosLines()));
    lines.push(...(await this.electionLines()));
    lines.push(...(await this.attendanceLines()));

    return lines.join('\n');
  }

  /** Ubicacion de cada unidad (mapa) con enlace de Google Maps. */
  private async mapLines(): Promise<string[]> {
    const taxis = await this.mapaRepository.findTaxis();

    if (taxis.length === 0) {
      return ['- Mapa: ningun socio ha compartido su ubicacion todavia.'];
    }

    const lines = [`- Unidades en el mapa (${taxis.length}):`];
    for (const taxi of taxis) {
      const hace = new Date(taxi.capturedAt).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' });
      lines.push(
        `  - Unidad ${taxi.numeroUnidad ?? 'sin unidad'} | placa ${taxi.placa ?? 'sin placa'} | ${taxi.socioNombre} | estado ${taxi.unidadEstado ?? 'sin unidad'} | ${taxi.latitud.toFixed(5)}, ${taxi.longitud.toFixed(5)} | actualizado ${hace} | mapa: ${mapsLink(taxi.latitud, taxi.longitud)}`
      );
    }

    return lines;
  }

  /** Listado corto de socios para responder preguntas puntuales. */
  private async sociosLines(): Promise<string[]> {
    const result = await this.socioRepository.findAll({ page: 1, limit: MAX_SOCIOS });
    const lines = [`- Socios (primeros ${result.items.length} de ${result.total}):`];

    for (const socio of result.items) {
      const ubicacion = await this.unidadRepository.findAll({ socioId: socio.id, page: 1, limit: 1 });
      const unidad = ubicacion.items[0];
      const asistencia = await this.asistenciaRepository.findUltimaBySocioId(socio.id);

      lines.push(
        `  - ${socio.nombres} ${socio.apellidos} | CI ${socio.cedulaRuc} | ${socio.estado} | tel ${socio.telefono} | ${socio.unidadesCount ?? 0} unidad(es)${unidad ? ` (${unidad.numeroUnidad} ${unidad.placa})` : ''}${asistencia ? ` | ultima reunion ${asistencia.fecha}: ${asistencia.presente ? 'presente' : 'ausente'}` : ''}`
      );
    }

    const taxis = await this.mapaRepository.findTaxis();
    if (taxis.length > 0) {
      lines.push('  - Ubicaciones de socios con GPS:');
      for (const taxi of taxis) {
        lines.push(`    - ${taxi.socioNombre}: ${mapsLink(taxi.latitud, taxi.longitud)}`);
      }
    }

    return lines;
  }

  /** Resultados de la ultima eleccion. */
  private async electionLines(): Promise<string[]> {
    const list = await this.votacionRepository.findAll({ page: 1, limit: 1 });
    const election = list.items[0];

    if (!election) return ['- Votaciones: no hay elecciones registradas.'];

    const lines = [`- Ultima eleccion: "${election.title}" | estado ${election.status} | ${election.votesCount} votos.`];
    const results = await this.votacionRepository.getResults(election.id);

    if (results) {
      for (const option of results.options) {
        lines.push(`  - ${option.title}: ${option.voteCount} votos (${option.percentage}%).`);
      }
    }

    return lines;
  }

  /** Asistencia de la ultima reunion registrada. */
  private async attendanceLines(): Promise<string[]> {
    const fecha = await this.asistenciaRepository.findUltimaFecha();
    if (!fecha) return ['- Asistencia: todavia no se ha registrado ninguna reunion.'];

    const presentes = await this.asistenciaRepository.countPresentesByFecha(fecha);
    return [`- Asistencia ultima reunion (${fecha}): ${presentes} socios presentes.`];
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

    const list = await this.votacionRepository.findAll({ page: 1, limit: 1 });
    const ultima = list.items[0];

    if (ultima) {
      lines.push(`- Ultima eleccion: "${ultima.title}" | estado ${ultima.status} | ${ultima.votesCount} votos.`);

      if (ultima.status === 'CLOSED') {
        const results = await this.votacionRepository.getResults(ultima.id);
        for (const option of results?.options ?? []) {
          lines.push(`  - ${option.title}: ${option.voteCount} votos (${option.percentage}%).`);
        }
      } else {
        lines.push('  - Resultados no publicados: se muestran cuando la eleccion se cierre.');
      }
    }

    const asistencia = await this.asistenciaRepository.findUltimaBySocioId(socio.id);
    if (asistencia) {
      lines.push(
        `- Asistencia a la ultima reunion (${asistencia.fecha}): ${asistencia.presente ? 'PRESENTE' : 'AUSENTE'}.`
      );
    } else {
      lines.push('- Asistencia: no tienes registro de asistencia a reuniones.');
    }

    return lines.join('\n');
  }
}
