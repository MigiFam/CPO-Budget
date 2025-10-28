import { useBudgetLines } from '../hooks/useBudgetLines';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Loader2, Plus } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  DESIGN: 'Design',
  CONSTRUCTION: 'Construction',
  EQUIPMENT: 'Equipment',
  CONTINGENCY: 'Contingency',
  SOFT_COSTS: 'Soft Costs',
  TESTING: 'Testing',
  OTHER: 'Other',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

interface BudgetLinesTableProps {
  budgetId: string;
  onAddClick?: () => void;
}

export function BudgetLinesTable({ budgetId, onAddClick }: BudgetLinesTableProps) {
  const { data: budgetLines, isLoading } = useBudgetLines(budgetId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!budgetLines || budgetLines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Budget Lines</CardTitle>
            <Button onClick={onAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Budget Line
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-600">
            <p className="mb-4">No budget lines defined yet.</p>
            <Button onClick={onAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Budget Line
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totals = budgetLines.reduce(
    (acc, line) => ({
      baseline: acc.baseline + Number(line.baselineAmount),
      committed: acc.committed + Number(line.committedToDate),
      actuals: acc.actuals + Number(line.actualsToDate),
      variance: acc.variance + Number(line.variance),
    }),
    { baseline: 0, committed: 0, actuals: 0, variance: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Budget Lines</CardTitle>
          <Button onClick={onAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Budget Line
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Cost Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Baseline</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Committed</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actuals</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Variance</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">% Used</th>
              </tr>
            </thead>
            <tbody>
              {budgetLines.map((line) => {
                const baseline = Number(line.baselineAmount);
                const actuals = Number(line.actualsToDate);
                const percentUsed = baseline > 0 ? (actuals / baseline) * 100 : 0;
                const variance = Number(line.variance);

                return (
                  <tr key={line.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{line.costCode}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {categoryLabels[line.category] || line.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {line.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(baseline)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(Number(line.committedToDate))}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(actuals)}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      variance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(variance))}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`${
                        percentUsed > 100 ? 'text-red-600 font-medium' : 'text-gray-600'
                      }`}>
                        {percentUsed.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              
              {/* Totals Row */}
              <tr className="bg-gray-50 font-bold border-t-2">
                <td colSpan={3} className="py-3 px-4">Total</td>
                <td className="py-3 px-4 text-right">{formatCurrency(totals.baseline)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(totals.committed)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(totals.actuals)}</td>
                <td className={`py-3 px-4 text-right ${
                  totals.variance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(Math.abs(totals.variance))}
                </td>
                <td className="py-3 px-4 text-right">
                  {totals.baseline > 0 
                    ? ((totals.actuals / totals.baseline) * 100).toFixed(1) 
                    : '0.0'}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
