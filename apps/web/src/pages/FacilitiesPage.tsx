import { useState, useEffect } from 'react';
import { Building2, MapPin, Code, FolderKanban } from 'lucide-react';
import { api } from '../lib/api';
import type { Facility } from '@cpo/types';

interface FacilityWithStats extends Facility {
  _count?: {
    projects: number;
  };
}

export function FacilitiesPage() {
  const [facilities, setFacilities] = useState<FacilityWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<FacilityWithStats[]>('/api/facilities');
      setFacilities(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load facilities');
      console.error('Failed to fetch facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = facilities.filter((facility) => {
    if (filter === 'all') return true;
    return facility.type === filter;
  });

  const facilityTypes = Array.from(new Set(facilities.map((f) => f.type)));
  const totalProjects = facilities.reduce((sum, f) => sum + (f._count?.projects || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading facilities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Facilities</h1>
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
          <h1 className="text-3xl font-bold">Facilities</h1>
          <p className="text-muted-foreground mt-1">
            Manage school buildings and educational facilities
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Facilities</p>
              <p className="text-2xl font-bold">{facilities.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FolderKanban className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold">{totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Code className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Facility Types</p>
              <p className="text-2xl font-bold">{facilityTypes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center bg-white border rounded-lg p-4">
        <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({facilities.length})
        </button>
        {facilityTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === type
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type} ({facilities.filter((f) => f.type === type).length})
          </button>
        ))}
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.map((facility) => (
          <div
            key={facility.id}
            className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{facility.name}</h3>
                  {facility.code && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {facility.code}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Code className="w-4 h-4" />
                <span className="capitalize">{facility.type}</span>
              </div>

              {facility.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{facility.address}</span>
                </div>
              )}

              {facility.region && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{facility.region}</span>
                </div>
              )}

              <div className="pt-3 mt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Projects</span>
                  <span className="text-sm font-semibold">
                    {facility._count?.projects || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFacilities.length === 0 && (
        <div className="bg-gray-50 border border-dashed rounded-lg p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No facilities found
          </h3>
          <p className="text-muted-foreground">
            {filter === 'all'
              ? 'No facilities have been added yet.'
              : `No facilities of type "${filter}" found.`}
          </p>
        </div>
      )}
    </div>
  );
}
