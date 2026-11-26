import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { asistenciaApi } from '../api/asistencia.api';

export const asistenciaKeys = {
  all: ['asistencias'] as const,
  fecha: (fecha: string) => [...asistenciaKeys.all, fecha] as const,
};

export function useAsistencia(fecha: string) {
  return useQuery({
    queryKey: asistenciaKeys.fecha(fecha),
    queryFn: () => asistenciaApi.get(fecha),
    staleTime: 10_000,
    retry: false,
  });
}

export function useAsistenciaMutation(fecha: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (registros: Array<{ socioId: string; presente: boolean }>) => asistenciaApi.save(fecha, registros),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: asistenciaKeys.all });
    },
  });
}
