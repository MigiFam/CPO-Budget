import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface FundingSource {
  id: string;
  name: string;
  type: 'BOND' | 'LEVY' | 'GRANT' | 'OTHER';
  code?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export function useFundingSources(type?: string) {
  return useQuery({
    queryKey: ['funding-sources', type],
    queryFn: async () => {
      const url = type ? `/api/funding-sources?type=${type}` : '/api/funding-sources';
      const response = await api.get<FundingSource[]>(url);
      return response.data;
    },
  });
}

export function useFundingSource(fundingSourceId: string) {
  return useQuery({
    queryKey: ['funding-sources', fundingSourceId],
    queryFn: async () => {
      const response = await api.get<FundingSource>(`/api/funding-sources/${fundingSourceId}`);
      return response.data;
    },
    enabled: !!fundingSourceId,
  });
}
