import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCheck, CheckCircle2, Search, ShieldAlert, UsersRound, XCircle } from 'lucide-react';
import { Badge } from '@components/Badge';
import { Button } from '@components/Button';
import { EmptyState } from '@components/EmptyState';
import { getApiErrorMessage } from '@shared/api/errors';
import { useDebounce } from '@shared/hooks/useDebounce';
import { formatFechaLarga, hoyISO } from '../model/types';
import { useAsistencia, useAsistenciaMutation } from '../hooks/useAsistencia';

/** Marca de asistencia de los socios para una fecha (dentro del modulo de votaciones). */
export function AsistenciaPanel() {
  const [fecha, setFecha] = useState(hoyISO);
  const [query, setQuery] = useState('');
  const [borrador, setBorrador] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 250);
  const { data, isLoading, isError, error: queryError } = useAsistencia(fecha);
  const save = useAsistenciaMutation(fecha);

  useEffect(() => {
    if (!data) return;
    const next: Record<string, boolean> = {};
    for (const fila of data.registros) next[fila.socioId] = fila.presente;
    setBorrador(next);
    setNotice(null);
    setError(null);
  }, [data]);

  const registros = data?.registros ?? [];

  const filtrados = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    if (!term) return registros;
    return registros.filter(
      (fila) => fila.nombre.toLowerCase().includes(term) || fila.cedulaRuc.includes(term)
    );
  }, [registros, debouncedQuery]);

  const presentes = registros.filter((fila) => borrador[fila.socioId]).length;
  const total = registros.length;

  function toggle(socioId: string) {
    setBorrador((current) => ({ ...current, [socioId]: !current[socioId] }));
    setNotice(null);
  }

  function marcarTodos(valor: boolean) {
    const next: Record<string, boolean> = {};
    for (const fila of registros) next[fila.socioId] = valor;
    setBorrador(next);
    setNotice(null);
  }

  async function guardar() {
    setError(null);
    setNotice(null);

    try {
      await save.mutateAsync(registros.map((fila) => ({ socioId: fila.socioId, presente: Boolean(borrador[fila.socioId]) })));
      setNotice('Asistencia guardada correctamente.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo guardar la asistencia.'));
    }
  }

  return (
    <>
      <div className="asistencia-bar">
        <label className="asistencia-fecha">
          <CalendarDays size={15} />
          <input type="date" value={fecha} max={hoyISO()} onChange={(event) => setFecha(event.target.value)} />
        </label>
        <span className="asistencia-dia">{formatFechaLarga(fecha)}</span>

        <div className="asistencia-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar socio o cédula…"
            aria-label="Buscar socio"
          />
        </div>
      </div>

      <div className="asistencia-summary">
        <span className="asistencia-chip green">
          <CheckCircle2 size={14} /> {presentes} presentes
        </span>
        <span className="asistencia-chip red">
          <XCircle size={14} /> {total - presentes} ausentes
        </span>
        <span className="asistencia-chip">
          <UsersRound size={14} /> {total} socios
        </span>
        <span className="asistencia-pct">{total > 0 ? Math.round((presentes / total) * 100) : 0}% asistencia</span>
        <div className="asistencia-bulk">
          <Button variant="ghost" size="sm" onClick={() => marcarTodos(true)} disabled={total === 0}>
            <CheckCheck size={14} /> Todos presentes
          </Button>
          <Button variant="ghost" size="sm" onClick={() => marcarTodos(false)} disabled={total === 0}>
            Limpiar
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="inline-alert" role="alert">
          <ShieldAlert size={15} />
          <span>{getApiErrorMessage(queryError, 'No se pudo cargar la asistencia.')}</span>
        </div>
      ) : null}

      {isLoading ? (
        <p className="table-note">Cargando socios…</p>
      ) : filtrados.length === 0 ? (
        <EmptyState icon={UsersRound} title="Sin socios" description="No hay socios que coincidan con la búsqueda." />
      ) : (
        <div className="asistencia-list">
          {filtrados.map((fila) => {
            const presente = Boolean(borrador[fila.socioId]);
            return (
              <button
                key={fila.socioId}
                type="button"
                className={`asistencia-row${presente ? ' presente' : ''}`}
                onClick={() => toggle(fila.socioId)}
                aria-pressed={presente}
              >
                <span className={`asistencia-check${presente ? ' on' : ''}`}>
                  {presente ? <CheckCircle2 size={16} /> : null}
                </span>
                <span className="asistencia-info">
                  <strong>{fila.nombre}</strong>
                  <span>
                    {fila.cedulaRuc} · {fila.telefono} · {fila.unidades} {fila.unidades === 1 ? 'unidad' : 'unidades'}
                  </span>
                </span>
                {fila.estado !== 'ACTIVO' ? <Badge tone="orange">{fila.estado}</Badge> : null}
                <span className={`asistencia-state${presente ? ' on' : ''}`}>{presente ? 'Presente' : 'Ausente'}</span>
              </button>
            );
          })}
        </div>
      )}

      {notice ? <p className="ubicacion-notice">{notice}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}

      <div className="asistencia-actions">
        <Button onClick={guardar} disabled={save.isPending || total === 0}>
          {save.isPending ? 'Guardando…' : 'Guardar asistencia'}
        </Button>
      </div>
    </>
  );
}
