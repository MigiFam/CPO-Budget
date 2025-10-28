import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProject, useUpdateBudget } from '../hooks/useProjects';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { BudgetLinesTable } from '../components/BudgetLinesTable';
import { ProjectBudgetBreakdown } from '../components/ProjectBudgetBreakdown';
import { ProjectEditModal } from '../components/ProjectEditModal';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  DollarSign, 
  User, 
  Users, 
  FileText,
  TrendingUp,
  AlertCircle,
  Loader2,
  Receipt,
  Edit,
  MessageSquare,
  Save,
  X
} from 'lucide-react';
import { useState } from 'react';

type Tab = 'overview' | 'budget' | 'breakdown' | 'cost-events' | 'team' | 'comments';

const statusColors = {
  PLANNED: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const formatCurrency = (value?: number) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetFormData, setBudgetFormData] = useState({ committedToDate: 0, actualsToDate: 0 });
  
  const { data: project, isLoading, error } = useProject(id || '');
  const updateBudgetMutation = useUpdateBudget();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Project not found</h2>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'This project may have been deleted.'}
        </p>
        <Button onClick={() => navigate('/projects')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const budget = project.budgets?.[0];
  const projectBudget = project.projectBudgets?.[0];
  
  // Use projectBudget data if available, otherwise fall back to budget
  const baselineAmount = projectBudget 
    ? Number(projectBudget.approvedBudgetTotal || 0)
    : (budget ? Number(budget.baselineAmount) : 0);
  
  // If no budget record exists but projectBudget does, use 0 for committed/actuals
  // These can be edited via the Budget Progress card
  const committedToDate = budget ? Number(budget.committedToDate || 0) : 0;
  const actualsToDate = budget ? Number(budget.actualsToDate || 0) : 0;
  const variance = baselineAmount - actualsToDate;
  const percentSpent = baselineAmount > 0 ? (actualsToDate / baselineAmount) * 100 : 0;
  const percentCommitted = baselineAmount > 0 ? (committedToDate / baselineAmount) * 100 : 0;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'budget', label: 'Budget Lines', icon: DollarSign },
    { id: 'breakdown', label: 'Budget Breakdown', icon: Receipt },
    { id: 'cost-events', label: 'Cost Events', icon: TrendingUp },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'comments', label: 'Comments', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link to="/projects" className="hover:text-gray-900">Projects</Link>
            <span>/</span>
            <span>{project.name}</span>
          </div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status as keyof typeof statusColors]}`}>
              {project.status}
            </span>
            <span className="text-sm text-gray-600">{project.type}</span>
          </div>
        </div>
        <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Project
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Baseline Budget</div>
            <div className="text-2xl font-bold">{formatCurrency(baselineAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Committed</div>
            <div className="text-2xl font-bold">{formatCurrency(committedToDate)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {percentCommitted.toFixed(1)}% of budget
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Actuals</div>
            <div className="text-2xl font-bold">{formatCurrency(actualsToDate)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {percentSpent.toFixed(1)}% spent
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Variance</div>
            <div className={`text-2xl font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(variance))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {variance >= 0 ? 'Under budget' : 'Over budget'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Description</div>
                  <p className="text-gray-900">{project.description || 'No description provided'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Start Date</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(project.startDate)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">End Date</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(project.endDate)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Facility</div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span>{project.facility?.name || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Funding Source</div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span>{project.fundingSource?.name || 'N/A'}</span>
                    {project.fundingSource && (
                      <span className="text-xs text-gray-500">
                        ({project.fundingSource.type})
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Project Manager</div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{project.projectManager?.name || 'Unassigned'}</span>
                  </div>
                </div>

                {project.category && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Category</div>
                    <p className="text-gray-900">{project.category}</p>
                  </div>
                )}

                {project.priority && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Priority</div>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      project.priority <= 10 
                        ? 'bg-red-100 text-red-800' 
                        : project.priority <= 50
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      #{project.priority}
                    </span>
                  </div>
                )}

                {project.jurisdiction && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Jurisdiction</div>
                    <p className="text-gray-900">{project.jurisdiction}</p>
                  </div>
                )}

                {project.completionYear && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Completion Year</div>
                    <p className="text-gray-900">{project.completionYear}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Card */}
            {project.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{project.notes}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Budget Progress</CardTitle>
                  {!isEditingBudget && baselineAmount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setBudgetFormData({
                          committedToDate: committedToDate,
                          actualsToDate: actualsToDate,
                        });
                        setIsEditingBudget(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {isEditingBudget && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingBudget(false);
                          setBudgetFormData({ committedToDate: 0, actualsToDate: 0 });
                        }}
                        disabled={updateBudgetMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          // If no budget record exists, create one first
                          if (!budget?.id && baselineAmount > 0) {
                            try {
                              await api.post('/api/budgets', {
                                projectId: id,
                                baselineAmount: baselineAmount,
                                revisedAmount: baselineAmount,
                                committedToDate: budgetFormData.committedToDate,
                                actualsToDate: budgetFormData.actualsToDate,
                                variance: baselineAmount - budgetFormData.actualsToDate,
                              });
                              setIsEditingBudget(false);
                              // Refresh project data
                              queryClient.invalidateQueries({ queryKey: ['projects', id] });
                            } catch (error) {
                              console.error('Error creating budget:', error);
                            }
                          } else if (budget?.id) {
                            updateBudgetMutation.mutate({
                              budgetId: budget.id,
                              data: budgetFormData,
                            }, {
                              onSuccess: () => {
                                setIsEditingBudget(false);
                              },
                            });
                          }
                        }}
                        disabled={updateBudgetMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateBudgetMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {baselineAmount === 0 ? (
                  <p className="text-sm text-gray-500">No budget breakdown available. Please add a budget breakdown first.</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Committed</span>
                        {!isEditingBudget ? (
                          <span className="font-medium">{percentCommitted.toFixed(1)}%</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={budgetFormData.committedToDate}
                              onChange={(e) => setBudgetFormData({ ...budgetFormData, committedToDate: parseFloat(e.target.value) || 0 })}
                              className="w-32 text-right border rounded px-2 py-1 text-sm"
                              step="0.01"
                              placeholder="Amount"
                            />
                            <span className="text-xs text-gray-500">
                              ({baselineAmount > 0 ? ((budgetFormData.committedToDate / baselineAmount) * 100).toFixed(1) : '0.0'}%)
                            </span>
                          </div>
                        )}
                      </div>
                      {!isEditingBudget && (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(percentCommitted, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(committedToDate)} of {formatCurrency(baselineAmount)}
                          </div>
                        </>
                      )}
                      {isEditingBudget && (
                        <div className="text-xs text-gray-500 mt-1">
                          Baseline: {formatCurrency(baselineAmount)}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Spent (Actuals)</span>
                        {!isEditingBudget ? (
                          <span className="font-medium">{percentSpent.toFixed(1)}%</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={budgetFormData.actualsToDate}
                              onChange={(e) => setBudgetFormData({ ...budgetFormData, actualsToDate: parseFloat(e.target.value) || 0 })}
                              className="w-32 text-right border rounded px-2 py-1 text-sm"
                              step="0.01"
                              placeholder="Amount"
                            />
                            <span className="text-xs text-gray-500">
                              ({baselineAmount > 0 ? ((budgetFormData.actualsToDate / baselineAmount) * 100).toFixed(1) : '0.0'}%)
                            </span>
                          </div>
                        )}
                      </div>
                      {!isEditingBudget && (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                percentSpent > 100 ? 'bg-red-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(percentSpent, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(actualsToDate)} of {formatCurrency(baselineAmount)}
                          </div>
                        </>
                      )}
                      {isEditingBudget && (
                        <div className="text-xs text-gray-500 mt-1">
                          Baseline: {formatCurrency(baselineAmount)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Team Members</span>
                  <span className="font-medium">{project._count?.teams || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Comments</span>
                  <span className="font-medium">{project._count?.comments || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Issues</span>
                  <span className="font-medium">{project._count?.issues || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <BudgetLinesTable 
          budgetId={budget?.id || ''} 
          onAddClick={() => {
            // TODO: Open add budget line modal
            alert('Add budget line functionality coming soon');
          }}
        />
      )}

      {activeTab === 'breakdown' && (
        <ProjectBudgetBreakdown />
      )}

      {activeTab === 'cost-events' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cost Events</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Track invoices, change orders, and other cost impacts
                </p>
              </div>
              <Button>
                <DollarSign className="h-4 w-4 mr-2" />
                Add Cost Event
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Description</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-600">
                      No cost events recorded yet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'team' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Manage project team members and their roles
                </p>
              </div>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Project Manager (always shown) */}
              {project.projectManager && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{project.projectManager.name}</div>
                      <div className="text-sm text-gray-600">{project.projectManager.email}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    Project Manager
                  </span>
                </div>
              )}

              {/* Team Members List */}
              {(!project._count?.teams || project._count.teams === 0) && (
                <div className="text-center py-8 text-gray-600">
                  No additional team members yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'comments' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments & Discussion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Comment Input */}
              <div className="border-b pb-4">
                <textarea
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2 flex justify-end">
                  <Button size="sm">Post Comment</Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="text-gray-600 text-center py-8">
                No comments yet. Be the first to comment!
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      {project && (
        <ProjectEditModal
          project={project}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}
