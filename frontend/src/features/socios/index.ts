export { SociosPage } from './pages/SociosPage';
export { SocioFormModal } from './components/SocioFormModal';
export { SociosTable } from './components/SociosTable';
export { SocioStatusBadge } from './components/SocioStatusBadge';
export { useSocios, useSocioMutations, socioKeys } from './hooks/useSocios';
export { sociosApi } from './api/socios.api';
export { SOCIO_ESTADOS, EMPTY_SOCIO_FILTERS } from './model/types';
export type {
  CreateSocioInput,
  Socio,
  SocioEstado,
  SocioFilters,
  SocioFormValues,
  UpdateSocioInput,
} from './model/types';
