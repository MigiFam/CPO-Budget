import { useState, useEffect } from 'react';
import { useUpdateProject, Project, UpdateProjectData } from '../hooks/useProjects';
import { useFacilities } from '../hooks/useFacilities';
import { useFundingSources } from '../hooks/useFundingSources';
import { useUsers } from '../hooks/useUsers';
import { Button } from './ui/Button';
import { X } from 'lucide-react';

interface ProjectEditModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectEditModal({ project, isOpen, onClose }: ProjectEditModalProps) {
  const { data: facilities = [] } = useFacilities();
  const { data: fundingSources = [] } = useFundingSources();
  const { data: users = [] } = useUsers();
  const updateProject = useUpdateProject();

  const [formData, setFormData] = useState<UpdateProjectData>({
    name: project.name,
    description: project.description || '',
    facilityId: project.facility.id,
    fundingSourceId: project.fundingSource.id,
    projectType: project.type,
    projectManagerId: project.projectManager?.id || '',
    status: project.status,
    startDate: project.startDate ? project.startDate.split('T')[0] : '',
    endDate: project.endDate ? project.endDate.split('T')[0] : '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: project.name,
        description: project.description || '',
        facilityId: project.facility.id,
        fundingSourceId: project.fundingSource.id,
        projectType: project.type,
        projectManagerId: project.projectManager?.id || '',
        status: project.status,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
      });
    }
  }, [isOpen, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: {
          ...formData,
          projectManagerId: formData.projectManagerId || undefined,
        },
      });
      onClose();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">Edit Project</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project description"
              />
            </div>

            {/* Facility and Funding Source */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.facilityId}
                  onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select facility</option>
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Source <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.fundingSourceId}
                  onChange={(e) => setFormData({ ...formData, fundingSourceId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select funding source</option>
                  {fundingSources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name} ({source.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SMALL_WORKS">Small Works</option>
                  <option value="MAJOR">Major Project</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PLANNED">Planned</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>

            {/* Project Manager */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Manager
              </label>
              <select
                value={formData.projectManagerId}
                onChange={(e) => setFormData({ ...formData, projectManagerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {users
                  .filter(u => u.role === 'DIRECTOR' || u.role === 'PROJECT_MANAGER')
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateProject.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProject.isPending}
              >
                {updateProject.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            {updateProject.isError && (
              <div className="text-sm text-red-600">
                Failed to update project. Please try again.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
