import { useState, useEffect } from 'react';
import { DollarSign, Calendar, FolderKanban, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';
import type { FundingSource } from '@cpo/types';

interface FundingSourceWithStats extends FundingSource {
  _count?: {
    projects: number;
  };
  year?: number;
  totalAllocation?: number;
}

export function FundingSourcesPage() {
  const [fundingSources, setFundingSources] = useState<FundingSourceWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchFundingSources();
  }, []);

  const fetchFundingSources = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<FundingSourceWithStats[]>('/api/funding-sources');
      setFundingSources(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load funding sources');
      console.error('Failed to fetch funding sources:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSources = fundingSources.filter((source) => {
    if (filter === 'all') return true;
    return source.type === filter;
  });

  const fundingTypes = Array.from(new Set(fundingSources.map((f) => f.type)));
  const totalAllocation = fundingSources.reduce(
    (sum, f) => sum + Number(f.totalAllocation || 0),
    0
  );
  const totalProjects = fundingSources.reduce(
    (sum, f) => sum + (f._count?.projects || 0),
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatLargeCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return formatCurrency(amount);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      BOND: 'bg-blue-100 text-blue-700',
      LEVY: 'bg-green-100 text-green-700',
      GRANT: 'bg-purple-100 text-purple-700',
      DONATION: 'bg-orange-100 text-orange-700',
      OTHER: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || colors.OTHER;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading funding sources...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Funding Sources</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Funding Sources</h1>
          <p className="text-muted-foreground mt-1">
            Bonds, levies, and other capital funding sources
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Funding</p>
              <p className="text-2xl font-bold">{formatLargeCurrency(totalAllocation)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Funding Sources</p>
              <p className="text-2xl font-bold">{fundingSources.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FolderKanban className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold">{totalProjects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center bg-white border rounded-lg p-4 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({fundingSources.length})
        </button>
        {fundingTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === type
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type} ({fundingSources.filter((f) => f.type === type).length})
          </button>
        ))}
      </div>

      {/* Funding Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSources.map((source) => (
          <div
            key={source.id}
            className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{source.name}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                      source.type
                    )}`}
                  >
                    {source.type}
                  </span>
                  {source.code && (
                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-mono">
                      {source.code}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="space-y-3">
              {source.totalAllocation && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Total Allocation</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(source.totalAllocation)}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {source.year && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>Year</span>
                    </div>
                    <p className="font-semibold">{source.year}</p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <FolderKanban className="w-4 h-4" />
                    <span>Projects</span>
                  </div>
                  <p className="font-semibold">{source._count?.projects || 0}</p>
                </div>
              </div>

              {(source.startDate || source.endDate) && (
                <div className="pt-3 mt-3 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {source.startDate && (
                      <span>
                        {new Date(source.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    {source.startDate && source.endDate && <span>→</span>}
                    {source.endDate && (
                      <span>
                        {new Date(source.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSources.length === 0 && (
        <div className="bg-gray-50 border border-dashed rounded-lg p-12 text-center">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No funding sources found
          </h3>
          <p className="text-muted-foreground">
            {filter === 'all'
              ? 'No funding sources have been added yet.'
              : `No funding sources of type "${filter}" found.`}
          </p>
        </div>
      )}
    </div>
  );
}
