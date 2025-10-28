import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface BudgetLine {
  id: string;
  costCode: string;
  category: 'DESIGN' | 'CONSTRUCTION' | 'EQUIPMENT' | 'CONTINGENCY' | 'SOFT_COSTS' | 'TESTING' | 'OTHER';
  description?: string;
  baselineAmount: number;
  committedToDate: number;
  actualsToDate: number;
  variance: number;
  budgetId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetLineData {
  costCode: string;
  category: string;
  description?: string;
  baselineAmount: number;
}

export interface UpdateBudgetLineData {
  costCode?: string;
  category?: string;
  description?: string;
  baselineAmount?: number;
}

// Get all budget lines for a budget
export function useBudgetLines(budgetId: string | undefined) {
  return useQuery({
    queryKey: ['budgetLines', budgetId],
    queryFn: async () => {
      if (!budgetId) return [];
      const response = await api.get(`/api/budgets/${budgetId}/budget-lines`);
      return response.data as BudgetLine[];
    },
    enabled: !!budgetId,
  });
}

// Get single budget line
export function useBudgetLine(budgetLineId: string) {
  return useQuery({
    queryKey: ['budgetLine', budgetLineId],
    queryFn: async () => {
      const response = await api.get(`/api/budget-lines/${budgetLineId}`);
      return response.data as BudgetLine;
    },
    enabled: !!budgetLineId,
  });
}

// Create budget line mutation
export function useCreateBudgetLine(budgetId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBudgetLineData) => {
      const response = await api.post(`/api/budgets/${budgetId}/budget-lines`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetLines', budgetId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Update budget line mutation
export function useUpdateBudgetLine(budgetLineId: string, budgetId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateBudgetLineData) => {
      const response = await api.patch(`/api/budget-lines/${budgetLineId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetLine', budgetLineId] });
      queryClient.invalidateQueries({ queryKey: ['budgetLines', budgetId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Delete budget line mutation
export function useDeleteBudgetLine(budgetId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetLineId: string) => {
      await api.delete(`/api/budget-lines/${budgetLineId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetLines', budgetId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
