import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, MapPin, Navigation, ShieldAlert } from 'lucide-react';
import { Button } from '@components/Button';
import { formatCoords, mapsUrl, relativeTime } from '../model/format';
import { getCurrentPosition } from '../model/geolocation';
import { useMiUbicacion, useUbicacionMutations } from '../hooks/useUbicacion';

const AUTO_KEY = 'taxicoop.location.auto';
const AUTO_INTERVAL_MS = 5 * 60 * 1000;

/** Tarjeta del socio para compartir su ubicación con la cooperativa. */
export function UbicacionCard() {
  const { data, isLoading } = useMiUbicacion();
  const { save } = useUbicacionMutations();
  const { mutateAsync } = save;

  const [auto, setAuto] = useState(() => localStorage.getItem(AUTO_KEY) === '1');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const share = useCallback(
    async (silent = false) => {
      if (!silent) {
        setError(null);
        setNotice(null);
      }

      try {
        const position = await getCurrentPosition();
        await mutateAsync({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          precisionMetros: position.coords.accuracy,
        });
        if (!silent) setNotice('Ubicación compartida. El administrador ya puede verla.');
      } catch (requestError) {
        if (!silent) {
          setError(requestError instanceof Error ? requestError.message : 'No se pudo compartir tu ubicación.');
        }
      }
    },
    [mutateAsync],
  );

  useEffect(() => {
    localStorage.setItem(AUTO_KEY, auto ? '1' : '0');
    if (!auto) return;

    void share(true);
    const interval = setInterval(() => void share(true), AUTO_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [auto, share]);

  return (
    <section className="panel ubicacion-card">
      <div className="panel-heading">
        <div>
          <h2>Mi ubicación</h2>
          <p>Comparte dónde estás para que la cooperativa pueda ubicarte</p>
        </div>
      </div>

      {isLoading ? (
        <p className="table-note">Consultando tu ubicación…</p>
      ) : data ? (
        <div className="ubicacion-current">
          <span className="ubicacion-pin">
            <MapPin size={17} />
          </span>
          <div className="ubicacion-copy">
            <strong>{formatCoords(data.latitud, data.longitud)}</strong>
            <span>Actualizada {relativeTime(data.capturedAt)}</span>
          </div>
          <a className="ubicacion-map-link" href={mapsUrl(data.latitud, data.longitud)} target="_blank" rel="noreferrer">
            Ver mapa <ExternalLink size={13} />
          </a>
        </div>
      ) : (
        <div className="locked-note">
          <MapPin size={16} />
          <span>Todavía no has compartido tu ubicación.</span>
        </div>
      )}

      <div className="ubicacion-actions">
        <Button onClick={() => share()} disabled={save.isPending}>
          <Navigation size={15} /> {save.isPending ? 'Obteniendo ubicación…' : 'Compartir mi ubicación'}
        </Button>

        <label className="ubicacion-auto">
          <input type="checkbox" checked={auto} onChange={(event) => setAuto(event.target.checked)} />
          Actualizar automáticamente cada 5 minutos
        </label>
      </div>

      {notice ? <p className="ubicacion-notice">{notice}</p> : null}

      {error ? (
        <p className="ubicacion-error" role="alert">
          <ShieldAlert size={14} /> {error}
        </p>
      ) : null}
    </section>
  );
}
