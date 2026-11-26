import { ExternalLink, MapPin, MapPinOff, ShieldAlert } from 'lucide-react';
import { Modal } from '@components/Modal';
import type { Socio } from '@features/socios';
import { getApiErrorMessage } from '@shared/api/errors';
import { formatCoords, formatDateTime, mapsUrl, relativeTime } from '../model/format';
import { useSocioUbicacion } from '../hooks/useUbicacion';

type UbicacionModalProps = {
  socio: Socio | null;
  onClose: () => void;
};

/** Panel de administración: última ubicación y recorrido reciente de un socio. */
export function UbicacionModal({ socio, onClose }: UbicacionModalProps) {
  const { data, isLoading, isError, error } = useSocioUbicacion(socio?.id ?? null, Boolean(socio));
  const ultima = data?.ultima ?? null;

  return (
    <Modal
      open={Boolean(socio)}
      title={socio ? `Ubicación de ${socio.nombres} ${socio.apellidos}` : 'Ubicación del socio'}
      onClose={onClose}
    >
      {isLoading ? <p className="table-note">Consultando ubicación…</p> : null}

      {isError ? (
        <div className="inline-alert" role="alert">
          <ShieldAlert size={15} />
          <span>{getApiErrorMessage(error, 'No se pudo consultar la ubicación del socio.')}</span>
        </div>
      ) : null}

      {!isLoading && !isError && !ultima ? (
        <div className="locked-note">
          <MapPinOff size={16} />
          <span>Este socio todavía no ha compartido su ubicación desde su perfil.</span>
        </div>
      ) : null}

      {ultima ? (
        <>
          <div className="ubicacion-current">
            <span className="ubicacion-pin">
              <MapPin size={17} />
            </span>
            <div className="ubicacion-copy">
              <strong>{formatCoords(ultima.latitud, ultima.longitud)}</strong>
              <span>
                {relativeTime(ultima.capturedAt)}
                {ultima.precisionMetros !== null ? ` · precisión ±${Math.round(ultima.precisionMetros)} m` : ''}
              </span>
            </div>
            <a
              className="ubicacion-map-link"
              href={mapsUrl(ultima.latitud, ultima.longitud)}
              target="_blank"
              rel="noreferrer"
            >
              Ver en el mapa <ExternalLink size={13} />
            </a>
          </div>

          {data && data.historial.length > 1 ? (
            <div className="ubicacion-history">
              <span className="ubicacion-history-title">Últimas capturas</span>
              <ul>
                {data.historial.map((item) => (
                  <li key={item.id}>
                    <span>{formatDateTime(item.capturedAt)}</span>
                    <a href={mapsUrl(item.latitud, item.longitud)} target="_blank" rel="noreferrer">
                      {formatCoords(item.latitud, item.longitud)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
    </Modal>
  );
}
