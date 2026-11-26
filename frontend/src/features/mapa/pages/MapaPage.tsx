import { useEffect, useMemo, useRef, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { CarFront, ExternalLink, LocateFixed, MapPin, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@components/PageHeader';
import { relativeTime } from '@features/ubicacion';
import { getApiErrorMessage } from '@shared/api/errors';
import { useTaxisMapa } from '../hooks/useTaxisMapa';
import type { TaxiEnMapa } from '../api/mapa.api';

const QUITO: [number, number] = [-0.1807, -78.4678];

function toneFor(taxi: TaxiEnMapa): string {
  if (taxi.socioEstado === 'SUSPENDIDO' || taxi.unidadEstado === 'SUSPENDIDA') return '#e0453c';
  if (taxi.unidadEstado === 'EN_TRAMITE') return '#e2a13a';
  return '#22a06b';
}

/** Ajusta el encuadre del mapa a los marcadores. */
function FitBounds({ points }: { points: Array<[number, number]> }) {
  const map = useMap();
  const first = useRef(true);

  useEffect(() => {
    if (points.length === 0) return;

    if (first.current) {
      first.current = false;
      if (points.length === 1) {
        map.setView(points[0], 14);
        return;
      }
    }

    map.fitBounds(points, { padding: [50, 50], maxZoom: 15 });
  }, [map, points]);

  return null;
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (target) map.flyTo(target, 15, { duration: 0.8 });
  }, [map, target]);

  return null;
}

export function MapaPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useTaxisMapa();
  const [selected, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState<[number, number] | null>(null);

  const taxis = data ?? [];

  const points = useMemo<Array<[number, number]>>(
    () => taxis.map((taxi) => [taxi.latitud, taxi.longitud] as [number, number]),
    [taxis]
  );

  const operativas = taxis.filter((taxi) => taxi.unidadEstado === 'OPERATIVA').length;
  const suspendidas = taxis.length - operativas;

  function centrar(taxi: TaxiEnMapa) {
    setSelected(taxi.socioId);
    setFocus([taxi.latitud + 0.0001, taxi.longitud + 0.0001]);
  }

  return (
    <>
      <PageHeader
        eyebrow="OPERACIÓN"
        title="Mapa de taxis"
        subtitle="Última ubicación compartida por cada socio en Quito. Se actualiza cada minuto."
        action={
          <button className="primary-button" onClick={() => refetch()} disabled={isFetching}>
            <LocateFixed size={16} /> {isFetching ? 'Actualizando…' : 'Actualizar'}
          </button>
        }
      />

      <div className="mapa-stats">
        <span className="asistencia-chip green">
          <CarFront size={14} /> {operativas} operativas
        </span>
        <span className="asistencia-chip red">
          <ShieldAlert size={14} /> {suspendidas} fuera de operación
        </span>
        <span className="asistencia-chip">
          <MapPin size={14} /> {taxis.length} en el mapa
        </span>
      </div>

      {isError ? (
        <div className="inline-alert" role="alert">
          <ShieldAlert size={15} />
          <span>{getApiErrorMessage(error, 'No se pudieron cargar las ubicaciones.')}</span>
        </div>
      ) : null}

      <div className="mapa-layout">
        <div className="mapa-canvas">
          <MapContainer center={QUITO} zoom={12} scrollWheelZoom className="mapa-leaflet">
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
            <FitBounds points={points} />
            <FlyTo target={focus} />

            {taxis.map((taxi) => (
              <CircleMarker
                key={taxi.socioId}
                center={[taxi.latitud, taxi.longitud]}
                radius={selected === taxi.socioId ? 12 : 9}
                pathOptions={{
                  color: '#ffffff',
                  weight: selected === taxi.socioId ? 3 : 2,
                  fillColor: toneFor(taxi),
                  fillOpacity: 0.95,
                }}
                eventHandlers={{ click: () => setSelected(taxi.socioId) }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                  <strong>{taxi.numeroUnidad ?? 'Sin unidad'}</strong> · {taxi.placa ?? 'sin placa'}
                </Tooltip>
                <Popup>
                  <strong>{taxi.socioNombre}</strong>
                  <br />
                  Unidad {taxi.numeroUnidad ?? '—'} · Placa {taxi.placa ?? '—'}
                  <br />
                  {taxi.unidadEstado ?? 'Sin unidad'} · {relativeTime(taxi.capturedAt)}
                  {taxi.precisionMetros !== null ? ` · ±${Math.round(taxi.precisionMetros)} m` : ''}
                  <br />
                  <a
                    href={`https://www.google.com/maps?q=${taxi.latitud},${taxi.longitud}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir en Google Maps
                  </a>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {!isLoading && taxis.length === 0 ? (
            <div className="mapa-empty">
              <MapPin size={20} />
              <strong>Todavía nadie comparte su ubicación</strong>
              <span>Los socios deben usar «Compartir mi ubicación» en Mi perfil.</span>
            </div>
          ) : null}
        </div>

        <aside className="mapa-side">
          <div className="mapa-side-head">
            <h2>Taxis conectados</h2>
            <span>{isLoading ? 'Cargando…' : `${taxis.length} registrados`}</span>
          </div>

          <div className="mapa-list">
            {taxis.map((taxi) => (
              <button
                key={taxi.socioId}
                type="button"
                className={`mapa-item${selected === taxi.socioId ? ' active' : ''}`}
                onClick={() => centrar(taxi)}
              >
                <span className="mapa-dot" style={{ background: toneFor(taxi) }} />
                <span className="mapa-item-copy">
                  <strong>{taxi.numeroUnidad ?? 'Sin unidad'}</strong>
                  <span>{taxi.placa ?? 'Sin placa'}</span>
                </span>
                <span className="mapa-item-time">{relativeTime(taxi.capturedAt)}</span>
              </button>
            ))}
          </div>

          <a
            className="panel-link"
            href={`https://www.google.com/maps/@${QUITO[0]},${QUITO[1]},13z`}
            target="_blank"
            rel="noreferrer"
          >
            Ver Quito en Google Maps <ExternalLink size={13} />
          </a>
        </aside>
      </div>
    </>
  );
}
