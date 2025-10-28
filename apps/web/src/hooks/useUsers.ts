import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'DIRECTOR' | 'PROJECT_MANAGER' | 'FINANCE' | 'TEAM_MEMBER' | 'VIEWER';
  status: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get<User[]>('/api/users');
      return response.data;
    },
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      const response = await api.get<User>(`/api/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
}
