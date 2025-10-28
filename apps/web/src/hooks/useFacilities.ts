import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Facility {
  id: string;
  name: string;
  type: 'SCHOOL' | 'FACILITY' | 'ADMINISTRATIVE' | 'OTHER';
  address?: string;
  region?: string;
  code?: string;
  _count?: {
    projects: number;
  };
  createdAt: string;
  updatedAt: string;
}

export function useFacilities(type?: string) {
  return useQuery({
    queryKey: ['facilities', type],
    queryFn: async () => {
      const url = type ? `/api/facilities?type=${type}` : '/api/facilities';
      const response = await api.get<Facility[]>(url);
      return response.data;
    },
  });
}

export function useFacility(facilityId: string) {
  return useQuery({
    queryKey: ['facilities', facilityId],
    queryFn: async () => {
      const response = await api.get<Facility>(`/api/facilities/${facilityId}`);
      return response.data;
    },
    enabled: !!facilityId,
  });
}
