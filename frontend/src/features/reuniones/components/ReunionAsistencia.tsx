import { useEffect, useMemo, useState } from 'react';
import { CheckCheck, CheckCircle2, Search, ShieldAlert, UsersRound, XCircle } from 'lucide-react';
import { Badge } from '@components/Badge';
import { Button } from '@components/Button';
import { EmptyState } from '@components/EmptyState';
import { getApiErrorMessage } from '@shared/api/errors';
import { useDebounce } from '@shared/hooks/useDebounce';
import { useReunionDetalle, useReunionMutations } from '../hooks/useReuniones';

/** Marcado de asistencia de una reunión concreta (solo administración). */
export function ReunionAsistencia({ reunionId }: { reunionId: string }) {
  const { data, isLoading, isError, error } = useReunionDetalle(reunionId);
  const { guardarAsistencia } = useReunionMutations();

  const [borrador, setBorrador] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (!data) return;
    const next: Record<string, boolean> = {};
    for (const fila of data.registros) next[fila.socioId] = fila.presente;
    setBorrador(next);
    setNotice(null);
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

  async function guardar() {
    setSaveError(null);
    setNotice(null);

    try {
      await guardarAsistencia.mutateAsync({
        id: reunionId,
        registros: registros.map((fila) => ({ socioId: fila.socioId, presente: Boolean(borrador[fila.socioId]) })),
      });
      setNotice('Asistencia guardada correctamente.');
    } catch (requestError) {
      setSaveError(getApiErrorMessage(requestError, 'No se pudo guardar la asistencia.'));
    }
  }

  if (isLoading) return <p className="table-note">Cargando socios…</p>;

  if (isError) {
    return (
      <div className="inline-alert" role="alert">
        <ShieldAlert size={15} />
        <span>{getApiErrorMessage(error, 'No se pudo cargar la reunión.')}</span>
      </div>
    );
  }

  return (
    <>
      <div className="asistencia-summary">
        <span className="asistencia-chip green">
          <CheckCircle2 size={14} /> {presentes} presentes
        </span>
        <span className="asistencia-chip red">
          <XCircle size={14} /> {registros.length - presentes} ausentes
        </span>
        <span className="asistencia-chip">
          <UsersRound size={14} /> {registros.length} socios
        </span>
        <span className="asistencia-pct">
          {registros.length > 0 ? Math.round((presentes / registros.length) * 100) : 0}% asistencia
        </span>
      </div>

      <div className="asistencia-bar">
        <div className="asistencia-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar socio o cédula…"
            aria-label="Buscar socio"
          />
        </div>
        <div className="asistencia-bulk">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const next: Record<string, boolean> = {};
              for (const fila of registros) next[fila.socioId] = true;
              setBorrador(next);
            }}
          >
            <CheckCheck size={14} /> Todos presentes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const next: Record<string, boolean> = {};
              for (const fila of registros) next[fila.socioId] = false;
              setBorrador(next);
            }}
          >
            Limpiar
          </Button>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState icon={UsersRound} title="Sin resultados" description="No hay socios que coincidan con la búsqueda." />
      ) : (
        <div className="asistencia-list">
          {filtrados.map((fila) => {
            const presente = Boolean(borrador[fila.socioId]);

            return (
              <button
                key={fila.socioId}
                type="button"
                className={`asistencia-row${presente ? ' presente' : ''}`}
                onClick={() => setBorrador((current) => ({ ...current, [fila.socioId]: !presente }))}
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
      {saveError ? (
        <p className="form-error" role="alert">
          {saveError}
        </p>
      ) : null}

      <div className="asistencia-actions">
        <Button onClick={guardar} disabled={guardarAsistencia.isPending || registros.length === 0}>
          {guardarAsistencia.isPending ? 'Guardando…' : 'Guardar asistencia'}
        </Button>
      </div>
    </>
  );
}
