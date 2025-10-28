import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface ActivityItem {
  id: string;
  type: string;
  action: string;
  entity: string;
  entityId: string;
  user: string;
  projectName?: string;
  timestamp: string;
  message: string;
  preview?: string;
  status?: string;
  amount?: number;
}

export interface AlertItem {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  projectId?: string;
  projectName?: string;
  message: string;
  amount?: number;
  count?: number;
  items?: any[];
  timestamp: string;
}

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  totalBudget: number;
  committedCosts: number;
  actualCosts: number;
  variance: number;
  byFundingSource: Array<{
    fundingSourceId: string;
    fundingSourceName: string;
    fundingSourceType: string;
    projectCount: number;
    totalBudget: number;
    committed: number;
    actuals: number;
    variance: number;
  }>;
  byFacility: Array<{
    facilityId: string;
    facilityName: string;
    projectCount: number;
    totalBudget: number;
  }>;
  recentActivity: ActivityItem[];
  alerts: AlertItem[];
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // For now, we'll calculate this from projects data
      // In production, you'd have a dedicated dashboard endpoint
      const projectsResponse = await api.get('/api/projects');
      const projects = projectsResponse.data;

      // Calculate summary
      const summary: DashboardSummary = {
        totalProjects: projects.length,
        activeProjects: projects.filter((p: any) => p.status === 'ACTIVE').length,
        totalBudget: 0,
        committedCosts: 0,
        actualCosts: 0,
        variance: 0,
        byFundingSource: [],
        byFacility: [],
        recentActivity: [],
        alerts: [],
      };

      // Aggregate by funding source
      const fundingSourceMap = new Map();
      const facilityMap = new Map();

      projects.forEach((project: any) => {
        const budget = project.budgets?.[0];
        if (budget) {
          summary.totalBudget += Number(budget.baselineAmount || 0);
          summary.committedCosts += Number(budget.committedToDate || 0);
          summary.actualCosts += Number(budget.actualsToDate || 0);
          summary.variance += Number(budget.variance || 0);

          // By funding source
          const fsKey = project.fundingSource.id;
          if (!fundingSourceMap.has(fsKey)) {
            fundingSourceMap.set(fsKey, {
              fundingSourceId: project.fundingSource.id,
              fundingSourceName: project.fundingSource.name,
              fundingSourceType: project.fundingSource.type,
              projectCount: 0,
              totalBudget: 0,
              committed: 0,
              actuals: 0,
              variance: 0,
            });
          }
          const fsData = fundingSourceMap.get(fsKey);
          fsData.projectCount++;
          fsData.totalBudget += Number(budget.baselineAmount || 0);
          fsData.committed += Number(budget.committedToDate || 0);
          fsData.actuals += Number(budget.actualsToDate || 0);
          fsData.variance += Number(budget.variance || 0);

          // By facility
          const facKey = project.facility.id;
          if (!facilityMap.has(facKey)) {
            facilityMap.set(facKey, {
              facilityId: project.facility.id,
              facilityName: project.facility.name,
              projectCount: 0,
              totalBudget: 0,
            });
          }
          const facData = facilityMap.get(facKey);
          facData.projectCount++;
          facData.totalBudget += Number(budget.baselineAmount || 0);
        }
      });

      summary.byFundingSource = Array.from(fundingSourceMap.values());
      summary.byFacility = Array.from(facilityMap.values());

      // Fetch recent activity and alerts
      try {
        const [activityRes, alertsRes] = await Promise.all([
          api.get('/api/audit/recent-activity?limit=10'),
          api.get('/api/audit/alerts'),
        ]);
        summary.recentActivity = activityRes.data;
        summary.alerts = alertsRes.data;
      } catch (error) {
        console.warn('Failed to fetch activity/alerts:', error);
        // Continue with empty activity/alerts
      }

      return summary;
    },
  });
}
