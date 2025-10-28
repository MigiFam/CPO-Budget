import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Button } from './ui/Button';
import { Edit, Save, X } from 'lucide-react';

interface ProjectBudgetDetail {
  id: string;
  asOfDate: string | null;
  approvedBudgetTotal: number | null;
  baseBidPlusAlts: number | null;
  changeOrdersTotal: number | null;
  salesTaxRatePercent: number | null;
  cpoManagementRatePercent: number | null;
  techMisc: number | null;
  consultants: number | null;
  // Computed fields
  salesTaxAmount: number | null;
  constructionCostSubtotal: number | null;
  cpoManagementAmount: number | null;
  otherCostSubtotal: number | null;
  totalProjectCost: number | null;
  remainder: number | null;
}

interface Project {
  id: string;
  name: string;
  category: string | null;
  fundingSource: {
    name: string;
  };
  projectBudgets: ProjectBudgetDetail[];
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  // Convert Decimal to number if needed
  const numValue = typeof value === 'object' ? Number(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '';
  const numValue = typeof value === 'object' ? Number(value) : value;
  return `(${numValue}%)`;
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US');
};

export const ProjectBudgetBreakdown: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProjectBudgetDetail>>({});

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['project-budget-detail', id],
    queryFn: async () => {
      const response = await api.get(`/api/projects/${id}?include=projectBudgets,fundingSource`);
      return response.data;
    },
  });

  const saveBudgetMutation = useMutation({
    mutationFn: async (data: Partial<ProjectBudgetDetail>) => {
      const budgetId = project?.projectBudgets?.[0]?.id;
      if (budgetId) {
        // Update existing budget
        return await api.patch(`/api/budgets/project-budgets/${budgetId}`, data);
      } else {
        // Create new budget
        return await api.post('/api/budgets/project-budgets', {
          ...data,
          projectId: id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-budget-detail', id] });
      setIsEditing(false);
    },
  });

  const budget = project?.projectBudgets?.[0];

  // Initialize form data when budget loads
  React.useEffect(() => {
    if (budget && !isEditing) {
      const toNum = (val: any) => {
        if (val === null || val === undefined) return 0;
        return typeof val === 'object' ? Number(val) : Number(val) || 0;
      };

      setFormData({
        approvedBudgetTotal: toNum(budget.approvedBudgetTotal),
        baseBidPlusAlts: toNum(budget.baseBidPlusAlts),
        changeOrdersTotal: toNum(budget.changeOrdersTotal),
        salesTaxRatePercent: toNum(budget.salesTaxRatePercent),
        cpoManagementRatePercent: toNum(budget.cpoManagementRatePercent),
        techMisc: toNum(budget.techMisc),
        consultants: toNum(budget.consultants),
      });
    }
  }, [budget, isEditing]);

  const handleFieldChange = (field: keyof ProjectBudgetDetail, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleEdit = () => {
    // Convert Decimal types to numbers
    const toNum = (val: any) => {
      if (val === null || val === undefined) return 0;
      return typeof val === 'object' ? Number(val) : Number(val) || 0;
    };

    if (budget) {
      setFormData({
        approvedBudgetTotal: toNum(budget.approvedBudgetTotal),
        baseBidPlusAlts: toNum(budget.baseBidPlusAlts),
        changeOrdersTotal: toNum(budget.changeOrdersTotal),
        salesTaxRatePercent: toNum(budget.salesTaxRatePercent),
        cpoManagementRatePercent: toNum(budget.cpoManagementRatePercent),
        techMisc: toNum(budget.techMisc),
        consultants: toNum(budget.consultants),
      });
    } else {
      setFormData({
        approvedBudgetTotal: 0,
        baseBidPlusAlts: 0,
        changeOrdersTotal: 0,
        salesTaxRatePercent: 0,
        cpoManagementRatePercent: 0,
        techMisc: 0,
        consultants: 0,
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleSave = () => {
    saveBudgetMutation.mutate(formData);
  };

  // Calculate derived values
  const calculateValues = (data: Partial<ProjectBudgetDetail>) => {
    // Convert Decimal types to numbers
    const toNum = (val: any) => {
      if (val === null || val === undefined) return 0;
      return typeof val === 'object' ? Number(val) : Number(val) || 0;
    };

    const baseBid = toNum(data.baseBidPlusAlts);
    const changeOrders = toNum(data.changeOrdersTotal);
    const salesTaxRate = toNum(data.salesTaxRatePercent);
    const cpoRate = toNum(data.cpoManagementRatePercent);
    const tech = toNum(data.techMisc);
    const consult = toNum(data.consultants);
    const approvedTotal = toNum(data.approvedBudgetTotal);

    const salesTaxAmount = baseBid * (salesTaxRate / 100);
    const constructionCostSubtotal = baseBid + changeOrders + salesTaxAmount;
    const cpoManagementAmount = constructionCostSubtotal * (cpoRate / 100);
    const otherCostSubtotal = cpoManagementAmount + tech + consult;
    const totalProjectCost = constructionCostSubtotal + otherCostSubtotal;
    const remainder = approvedTotal - totalProjectCost;

    return {
      salesTaxAmount,
      constructionCostSubtotal,
      cpoManagementAmount,
      otherCostSubtotal,
      totalProjectCost,
      remainder,
    };
  };

  const displayData = isEditing ? formData : budget;
  const calculated = calculateValues(displayData || {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="p-4 text-gray-500">Project not found</div>;
  }

  if (!budget && !isEditing) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
            <p className="text-gray-500">No budget details available</p>
          </div>
          <Button onClick={handleEdit}>Add Budget Breakdown</Button>
        </div>
      </div>
    );
  }

  const isOverBudget = (calculated.remainder || 0) < 0;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-b-4 border-orange-400 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{project.fundingSource.name}</p>
            {budget?.asOfDate && (
              <p className="text-xs text-gray-500 mt-1">
                Most Current Date: {formatDate(budget.asOfDate)}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={saveBudgetMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveBudgetMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveBudgetMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Budget Breakdown Table */}
      <div className="divide-y divide-gray-200">
        {/* Total Funding / Approved Budget */}
        <div className="grid grid-cols-3 gap-4 px-6 py-3 bg-blue-50 border-l-4 border-blue-500">
          <div className="col-span-2 font-bold text-gray-900">Total Funding (Approved Budget)</div>
          <div className="text-right font-bold text-blue-700 text-lg">
            {isEditing ? (
              <input
                type="number"
                value={displayData?.approvedBudgetTotal || 0}
                onChange={(e) => handleFieldChange('approvedBudgetTotal', e.target.value)}
                className="w-full text-right border rounded px-2 py-1"
                step="0.01"
              />
            ) : (
              formatCurrency(displayData?.approvedBudgetTotal || 0)
            )}
          </div>
        </div>

        {/* Construction Section */}
        <div className="px-6 py-2">
          <div className="grid grid-cols-3 gap-4 py-2">
            <div className="col-span-2 text-gray-700">Base Bid</div>
            <div className="text-right text-gray-900">
              {isEditing ? (
                <input
                  type="number"
                  value={displayData?.baseBidPlusAlts || 0}
                  onChange={(e) => handleFieldChange('baseBidPlusAlts', e.target.value)}
                  className="w-full text-right border rounded px-2 py-1"
                  step="0.01"
                />
              ) : (
                formatCurrency(displayData?.baseBidPlusAlts || 0)
              )}
            </div>
          </div>

          {(displayData?.changeOrdersTotal !== null && displayData?.changeOrdersTotal !== 0) || isEditing ? (
            <div className="grid grid-cols-3 gap-4 py-2">
              <div className="col-span-2 text-gray-700">
                Change Orders
              </div>
              <div className="text-right text-gray-900">
                {isEditing ? (
                  <input
                    type="number"
                    value={displayData?.changeOrdersTotal || 0}
                    onChange={(e) => handleFieldChange('changeOrdersTotal', e.target.value)}
                    className="w-full text-right border rounded px-2 py-1"
                    step="0.01"
                  />
                ) : (
                  formatCurrency(displayData?.changeOrdersTotal || 0)
                )}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-4 py-2">
            <div className="col-span-2 text-gray-700">
              Sales Tax {!isEditing && formatPercent(displayData?.salesTaxRatePercent || 0)}
              {isEditing && (
                <input
                  type="number"
                  value={displayData?.salesTaxRatePercent || 0}
                  onChange={(e) => handleFieldChange('salesTaxRatePercent', e.target.value)}
                  className="w-20 ml-2 text-right border rounded px-2 py-1"
                  step="0.01"
                  placeholder="%"
                />
              )}
            </div>
            <div className="text-right text-gray-900">{formatCurrency(calculated.salesTaxAmount)}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-2 bg-gray-50 -mx-6 px-6 font-semibold">
            <div className="col-span-2 text-gray-900">Construction Cost Subtotal:</div>
            <div className="text-right text-gray-900">
              {formatCurrency(calculated.constructionCostSubtotal)}
            </div>
          </div>
        </div>

        {/* Other Costs Section */}
        <div className="px-6 py-2">
          <div className="grid grid-cols-3 gap-4 py-2">
            <div className="col-span-2 text-gray-700">
              CPO Management {!isEditing && formatPercent(displayData?.cpoManagementRatePercent || 0)}
              {isEditing && (
                <input
                  type="number"
                  value={displayData?.cpoManagementRatePercent || 0}
                  onChange={(e) => handleFieldChange('cpoManagementRatePercent', e.target.value)}
                  className="w-20 ml-2 text-right border rounded px-2 py-1"
                  step="0.01"
                  placeholder="%"
                />
              )}
            </div>
            <div className="text-right text-gray-900">{formatCurrency(calculated.cpoManagementAmount)}</div>
          </div>

          {(displayData?.techMisc !== null && displayData?.techMisc !== 0) || isEditing ? (
            <div className="grid grid-cols-3 gap-4 py-2">
              <div className="col-span-2 text-gray-700">A/E Fee</div>
              <div className="text-right text-gray-900">
                {isEditing ? (
                  <input
                    type="number"
                    value={displayData?.techMisc || 0}
                    onChange={(e) => handleFieldChange('techMisc', e.target.value)}
                    className="w-full text-right border rounded px-2 py-1"
                    step="0.01"
                  />
                ) : (
                  formatCurrency(displayData?.techMisc || 0)
                )}
              </div>
            </div>
          ) : null}

          {(displayData?.consultants !== null && displayData?.consultants !== 0) || isEditing ? (
            <div className="grid grid-cols-3 gap-4 py-2">
              <div className="col-span-2 text-gray-700">Consultants</div>
              <div className="text-right text-gray-900">
                {isEditing ? (
                  <input
                    type="number"
                    value={displayData?.consultants || 0}
                    onChange={(e) => handleFieldChange('consultants', e.target.value)}
                    className="w-full text-right border rounded px-2 py-1"
                    step="0.01"
                  />
                ) : (
                  formatCurrency(displayData?.consultants || 0)
                )}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-4 py-2 bg-gray-50 -mx-6 px-6 font-semibold">
            <div className="col-span-2 text-gray-900">Other Cost Subtotal:</div>
            <div className="text-right text-gray-900">{formatCurrency(calculated.otherCostSubtotal)}</div>
          </div>
        </div>

        {/* Total Project Cost */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-orange-50 border-l-4 border-orange-500">
          <div className="col-span-2 font-bold text-lg text-gray-900">Total Project Cost (Calculated):</div>
          <div className="text-right font-bold text-lg text-orange-700">
            {formatCurrency(calculated.totalProjectCost)}
          </div>
        </div>

        {/* Remainder */}
        <div className={`grid grid-cols-3 gap-4 px-6 py-4 ${isOverBudget ? 'bg-red-50' : 'bg-green-50'}`}>
          <div className="col-span-2">
            <div className="font-semibold text-gray-900">Remaining Budget</div>
            <div className="text-xs text-gray-600 mt-1">
              (Total Funding - Total Project Cost)
            </div>
          </div>
          <div
            className={`text-right font-semibold text-lg ${
              isOverBudget ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {formatCurrency(calculated.remainder)}
          </div>
        </div>
      </div>

      {/* Budget Status Alert */}
      {isOverBudget && (
        <div className="bg-red-50 border-t-2 border-red-200 px-6 py-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-red-800">
              Project is over budget by {formatCurrency(Math.abs(calculated.remainder || 0))}
            </p>
          </div>
        </div>
      )}

      {!isOverBudget && calculated.remainder && calculated.remainder > 0 && (
        <div className="bg-green-50 border-t-2 border-green-200 px-6 py-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-green-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-green-800">
              Project is under budget by {formatCurrency(calculated.remainder)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
