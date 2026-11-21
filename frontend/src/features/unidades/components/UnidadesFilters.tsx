import { Search, X } from 'lucide-react';
import { UNIDAD_ESTADOS } from '../model/types';
import type { UnidadEstado, UnidadFilters } from '../model/types';

type UnidadesFiltersProps = {
  filters: UnidadFilters;
  total: number;
  socioLabel?: string;
  onChange: (partial: Partial<UnidadFilters>) => void;
  onClearSocio: () => void;
};

export function UnidadesFilters({ filters, total, socioLabel, onChange, onClearSocio }: UnidadesFiltersProps) {
  return (
    <div className="table-toolbar">
      <div className="search-box">
        <Search size={15} />
        <input
          type="search"
          value={filters.q}
          onChange={(event) => onChange({ q: event.target.value, page: 1 })}
          placeholder="Buscar por unidad, placa o socio…"
          aria-label="Buscar unidades"
        />
      </div>

      <select
        className="select"
        value={filters.estado}
        onChange={(event) => onChange({ estado: event.target.value as UnidadEstado | '', page: 1 })}
        aria-label="Filtrar por estado"
      >
        <option value="">Todos los estados</option>
        {UNIDAD_ESTADOS.map((estado) => (
          <option key={estado} value={estado}>
            {estado}
          </option>
        ))}
      </select>

      {filters.socioId ? (
        <span className="filter-chip">
          Socio: {socioLabel ?? 'seleccionado'}
          <button type="button" onClick={onClearSocio} aria-label="Quitar filtro de socio">
            <X size={12} />
          </button>
        </span>
      ) : null}

      <span className="table-count">
        {total} {total === 1 ? 'unidad' : 'unidades'}
      </span>
    </div>
  );
}
