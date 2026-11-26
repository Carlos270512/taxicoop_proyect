import { useQuery } from '@tanstack/react-query';
import { mapaApi } from '../api/mapa.api';

export const mapaKeys = {
  taxis: () => ['mapa', 'taxis'] as const,
};

export function useTaxisMapa() {
  return useQuery({
    queryKey: mapaKeys.taxis(),
    queryFn: mapaApi.taxis,
    staleTime: 20_000,
    refetchInterval: 60_000,
    retry: false,
  });
}
