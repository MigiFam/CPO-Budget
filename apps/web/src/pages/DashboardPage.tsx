import { useAuthStore } from '@/store/authStore';
import { useDashboard } from '../hooks/useDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { DollarSign, FolderKanban, AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import { UserRole } from '@cpo/types';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data: dashboard, isLoading } = useDashboard();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome, {user?.name}
        </h1>
        <p className="text-muted-foreground">
          {user?.role === UserRole.DIRECTOR
            ? 'Organization-wide overview'
            : 'Your assigned projects overview'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.activeProjects || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboard?.totalBudget || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all funding sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Committed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboard?.committedCosts || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.totalBudget
                ? `${((dashboard.committedCosts / dashboard.totalBudget) * 100).toFixed(1)}% of budget`
                : '0%'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Actuals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboard?.actualCosts || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.totalBudget
                ? `${((dashboard.actualCosts / dashboard.totalBudget) * 100).toFixed(1)}% spent`
                : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funding Sources Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Funding Sources Overview
          </CardTitle>
          <CardDescription>
            {user?.role === UserRole.DIRECTOR
              ? 'Combined view by bond/levy'
              : 'Your accessible funding sources'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboard?.byFundingSource && dashboard.byFundingSource.length > 0 ? (
              dashboard.byFundingSource.map((source) => (
                <Link
                  key={source.fundingSourceId}
                  to={`/projects?fundingSourceId=${source.fundingSourceId}`}
                  className="block"
                >
                  <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{source.fundingSourceName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {source.projectCount} project{source.projectCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                        {source.fundingSourceType}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Budget</div>
                        <div className="font-medium">
                          {formatCurrency(source.totalBudget)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Committed</div>
                        <div className="font-medium">
                          {formatCurrency(source.committed)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Actuals</div>
                        <div className="font-medium">
                          {formatCurrency(source.actuals)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Variance</div>
                        <div
                          className={`font-medium ${
                            source.variance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(source.variance)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Progress</div>
                        <div className="font-medium">
                          {source.totalBudget
                            ? `${((source.actuals / source.totalBudget) * 100).toFixed(1)}%`
                            : '0%'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No funding sources found</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates across your projects</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
              <div className="space-y-3 text-sm">
                {dashboard.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex justify-between items-start pb-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.message}</p>
                      {activity.projectName && (
                        <p className="text-xs text-muted-foreground mt-1">{activity.projectName}</p>
                      )}
                      {activity.preview && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          "{activity.preview}..."
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">by {activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {new Date(activity.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Alerts & Actions
            </CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard?.alerts && dashboard.alerts.length > 0 ? (
              <div className="space-y-3 text-sm">
                {dashboard.alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-2 pb-3 border-b last:border-0">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        alert.severity === 'high'
                          ? 'bg-red-500'
                          : alert.severity === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alert.message}</p>
                      {alert.projectName && (
                        <Link
                          to={`/projects/${alert.projectId}`}
                          className="text-xs text-primary hover:underline mt-1 block"
                        >
                          View {alert.projectName}
                        </Link>
                      )}
                      {alert.items && alert.items.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {alert.items.map((item: any, idx: number) => (
                            <p key={idx} className="text-xs text-muted-foreground">
                              • {item.projectName}: {item.title || item.type}
                              {item.amount && ` - $${item.amount.toLocaleString()}`}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm">No alerts - all systems normal</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
