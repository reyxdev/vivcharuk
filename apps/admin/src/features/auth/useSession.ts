import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, hasAccessToken, setAccessToken, tryRefresh } from '@/lib/api';

export interface Me {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  locale: string;
  roles: Array<{ key: string; name: string }>;
  permissions: string[];
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      if (!hasAccessToken() && !(await tryRefresh())) return null;
      return api<Me>('/auth/staff/me');
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function useSignedIn() {
  const qc = useQueryClient();
  return (accessToken: string) => {
    setAccessToken(accessToken);
    return qc.invalidateQueries({ queryKey: ['me'] });
  };
}

export function useSignOut() {
  const qc = useQueryClient();
  return async () => {
    await api('/auth/staff/logout', { method: 'POST' }).catch(() => undefined);
    setAccessToken(null);
    qc.setQueryData(['me'], null);
  };
}
