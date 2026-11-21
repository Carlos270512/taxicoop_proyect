import { Search } from 'lucide-react';
import { SOCIO_ESTADOS } from '../model/types';
import type { SocioEstado, SocioFilters } from '../model/types';

type SociosFiltersProps = {
  filters: SocioFilters;
  total: number;
  onChange: (partial: Partial<SocioFilters>) => void;
};

export function SociosFilters({ filters, total, onChange }: SociosFiltersProps) {
  return (
    <div className="table-toolbar">
      <div className="search-box">
        <Search size={15} />
        <input
          type="search"
          value={filters.q}
          onChange={(event) => onChange({ q: event.target.value, page: 1 })}
          placeholder="Buscar por nombre, cédula, teléfono o correo…"
          aria-label="Buscar socios"
        />
      </div>

      <select
        className="select"
        value={filters.estado}
        onChange={(event) => onChange({ estado: event.target.value as SocioEstado | '', page: 1 })}
        aria-label="Filtrar por estado"
      >
        <option value="">Todos los estados</option>
        {SOCIO_ESTADOS.map((estado) => (
          <option key={estado} value={estado}>
            {estado}
          </option>
        ))}
      </select>

      <span className="table-count">
        {total} {total === 1 ? 'socio' : 'socios'}
      </span>
    </div>
  );
}
