import { useQuery } from '@tanstack/react-query';
import { perfilApi } from '../api/perfil.api';

export const perfilKeys = {
  me: () => ['perfil', 'me'] as const,
};

export function useMiPerfil() {
  return useQuery({
    queryKey: perfilKeys.me(),
    queryFn: perfilApi.me,
    staleTime: 30_000,
    retry: false,
  });
}
