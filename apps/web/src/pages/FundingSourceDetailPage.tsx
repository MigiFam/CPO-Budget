import { useParams, Link } from 'react-router-dom';
import { useFundingSource } from '../hooks/useFundingSources';
import { ProjectCard } from '../components/ProjectCard';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  FolderKanban,
  Loader2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface FundingSourceWithProjects {
  id: string;
  name: string;
  code?: string;
  type: string;
  startDate?: string;
  endDate?: string;
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

export function FundingSourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: fundingSource, isLoading, error } = useFundingSource(id || '');

  if (!id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-1">No Funding Source ID</h3>
            <p className="text-yellow-700 mb-4">No funding source ID was provided in the URL.</p>
            <Link
              to="/funding-sources"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Funding Sources
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

  if (error || !fundingSource) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading Funding Source</h3>
            <p className="text-red-700 mb-4">
              {error instanceof Error ? error.message : 'Failed to load funding source details'}
            </p>
            <Link
              to="/funding-sources"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Funding Sources
            </Link>
            <pre className="text-xs mt-4 text-red-600">
              {JSON.stringify({ id, error: error?.toString() }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Additional safety check
  if (!fundingSource) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-1">Funding Source Not Found</h3>
            <p className="text-red-700 mb-4">
              The funding source you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link
              to="/funding-sources"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Funding Sources
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fundingData = fundingSource as unknown as FundingSourceWithProjects;
  const projects = fundingData?.projects || [];

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link 
        to="/funding-sources" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Funding Sources
      </Link>

      {/* Header Section */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{fundingData?.name || 'Unknown Funding Source'}</h1>
                {fundingData?.code && (
                  <p className="text-sm text-gray-500 font-mono mb-3">{fundingData.code}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(fundingData?.type || 'OTHER')}`}>
                {fundingData?.type || 'OTHER'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {(fundingData?.startDate || fundingData?.endDate) && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Period</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(fundingData.startDate)} → {formatDate(fundingData.endDate)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <FolderKanban className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Total Projects</p>
                  <p className="text-sm text-gray-900 font-semibold">{projects.length}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Source Type</p>
                  <p className="text-sm text-gray-900">{fundingData.type}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Projects Using this Funding Source</h2>
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
            This funding source doesn't have any projects assigned yet.
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
