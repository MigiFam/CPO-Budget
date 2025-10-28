import { Link } from 'react-router-dom';
import type { Project } from '../hooks/useProjects';
import { Card } from './ui/Card';

interface ProjectCardProps {
  project: Project;
}

const statusColors = {
  PLANNED: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const typeLabels = {
  SMALL_WORKS: 'Small Works',
  MAJOR: 'Major Project',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const budget = project.budgets?.[0];
  const variance = budget?.variance || 0;
  const variancePercent = budget?.baselineAmount
    ? ((variance / budget.baselineAmount) * 100).toFixed(1)
    : '0';

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {project.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {project.description || 'No description'}
              </p>
            </div>
            <span
              className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                statusColors[project.status]
              }`}
            >
              {project.status.replace('_', ' ')}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {project.facility.name}
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {project.fundingSource.name}
            </div>

            {project.projectManager && (
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="w-4 h-4 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {project.projectManager.name}
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              {typeLabels[project.type]}
            </div>
          </div>

          {/* Budget Summary */}
          {budget && (
            <div className="border-t pt-3">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Budget</p>
                  <p className="font-semibold text-gray-900">
                    ${(budget.baselineAmount / 1000).toFixed(0)}k
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Actuals</p>
                  <p className="font-semibold text-gray-900">
                    ${(budget.actualsToDate / 1000).toFixed(0)}k
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Variance</p>
                  <p
                    className={`font-semibold ${
                      variance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {variance >= 0 ? '+' : ''}
                    {variancePercent}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {project._count && (
                <>
                  <span>{project._count.teams} teams</span>
                  <span>{project._count.comments} comments</span>
                  <span>{project._count.issues} issues</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
