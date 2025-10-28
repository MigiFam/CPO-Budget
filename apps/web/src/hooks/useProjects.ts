import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: 'SMALL_WORKS' | 'MAJOR';
  status: 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'CLOSED';
  priority?: number;
  completionYear?: number;
  jurisdiction?: string;
  category?: string;
  fundingProgram?: string;
  notes?: string;
  startDate?: string;
  endDate?: string;
  estimatedDate?: string;
  facility: {
    id: string;
    name: string;
    type: string;
  };
  fundingSource: {
    id: string;
    name: string;
    type: string;
  };
  projectManager?: {
    id: string;
    name: string;
    email: string;
  };
  budgets?: Array<{
    id: string;
    baselineAmount: number;
    revisedAmount: number;
    committedToDate: number;
    actualsToDate: number;
    variance: number;
  }>;
  projectBudgets?: Array<{
    id: string;
    approvedBudgetTotal: number;
    baseBidPlusAlts: number;
    changeOrdersTotal: number;
    salesTaxRatePercent: number;
    cpoManagementRatePercent: number;
    techMisc: number;
    consultants: number;
    salesTaxAmount: number;
    constructionCostSubtotal: number;
    cpoManagementAmount: number;
    otherCostSubtotal: number;
    totalProjectCost: number;
    remainder: number;
    asOfDate: string;
  }>;
  _count?: {
    teams: number;
    comments: number;
    issues: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFilters {
  facilityId?: string;
  fundingSourceId?: string;
  status?: string;
  projectType?: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  facilityId: string;
  fundingSourceId: string;
  projectType: 'SMALL_WORKS' | 'MAJOR';
  projectManagerId?: string;
  status?: 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'CLOSED';
  startDate?: string;
  endDate?: string;
  baselineCost?: number;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.facilityId) params.append('facilityId', filters.facilityId);
      if (filters?.fundingSourceId) params.append('fundingSourceId', filters.fundingSourceId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.projectType) params.append('projectType', filters.projectType);
      
      const url = `/api/projects${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<Project[]>(url);
      return response.data;
    },
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const response = await api.get<Project>(`/api/projects/${projectId}`);
      return response.data;
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const response = await api.post<Project>('/api/projects', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectData }) => {
      const response = await api.patch<Project>(`/api/projects/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', data.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ budgetId, data }: { budgetId: string; data: { committedToDate?: number; actualsToDate?: number } }) => {
      const response = await api.patch(`/api/budgets/${budgetId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
