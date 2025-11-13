import { useParams, Link } from 'react-router-dom';
import { useFacility } from '../hooks/useFacilities';
import { ProjectCard } from '../components/ProjectCard';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  FolderKanban,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface FacilityWithProjects {
  id: string;
  name: string;
  code?: string;
  type: string;
  address?: string;
  region?: string;
  projects?: Array<{
    id: string;
    name: string;
    status: string;
    projectType: string;
    startDate?: string;
    endDate?: string;
    facility?: { id: string; name: string };
    fundingSource?: { id: string; name: string };
    projectManager?: { id: string; name: string };
    budgets?: Array<{ id: string }>;
    projectBudgets?: Array<{ id: string; baselineCost: number }>;
  }>;
}

export function FacilityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: facility, isLoading, error } = useFacility(id || '');

  console.log('FacilityDetailPage - id:', id);
  console.log('FacilityDetailPage - isLoading:', isLoading);
  console.log('FacilityDetailPage - error:', error);
  console.log('FacilityDetailPage - facility:', facility);

  if (!id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-1">No Facility ID</h3>
            <p className="text-yellow-700 mb-4">No facility ID was provided in the URL.</p>
            <Link
              to="/facilities"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Facilities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading Facility</h3>
            <p className="text-red-700 mb-4">
              {error instanceof Error ? error.message : 'Failed to load facility details'}
            </p>
            <Link
              to="/facilities"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Facilities
            </Link>
            <pre className="text-xs mt-4 text-red-600">
              {JSON.stringify({ id, error: error?.toString() }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  const facilityData = facility as unknown as FacilityWithProjects;
  const projects = facilityData.projects || [];

  console.log('FacilityDetailPage - facilityData:', facilityData);
  console.log('FacilityDetailPage - projects:', projects);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link 
        to="/facilities" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Facilities
      </Link>

      {/* Header Section */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{facilityData.name}</h1>
                {facilityData.code && (
                  <p className="text-sm text-gray-500 font-mono mb-3">{facilityData.code}</p>
                )}
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                {facilityData.type?.toLowerCase().replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {facilityData.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">{facilityData.address}</p>
                  </div>
                </div>
              )}

              {facilityData.region && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Region</p>
                    <p className="text-sm text-gray-900">{facilityData.region}</p>
                  </div>
                </div>
              )}              <div className="flex items-start gap-2">
                <FolderKanban className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Total Projects</p>
                  <p className="text-sm text-gray-900 font-semibold">{projects.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Projects at this Facility</h2>
          <span className="text-sm text-gray-500">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project as never} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed rounded-lg p-12 text-center">
          <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Projects Yet
          </h3>
          <p className="text-gray-600 mb-4">
            This facility doesn't have any projects assigned yet.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View All Projects
          </Link>
        </div>
      )}
    </div>
  );
}
