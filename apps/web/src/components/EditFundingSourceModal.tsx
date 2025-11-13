import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { X } from 'lucide-react';
import { api } from '../lib/api';
import type { FundingSource } from '@cpo/types';

interface EditFundingSourceModalProps {
  fundingSource: FundingSource;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fundingSource: FundingSource) => void;
}

const FUNDING_TYPES = [
  { value: 'BOND', label: 'Bond' },
  { value: 'LEVY', label: 'Levy' },
  { value: 'GRANT', label: 'Grant' },
  { value: 'OTHER', label: 'Other' },
] as const;

export function EditFundingSourceModal({ fundingSource, isOpen, onClose, onSuccess }: EditFundingSourceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'BOND' as const,
    startDate: '',
    endDate: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when fundingSource changes
  useEffect(() => {
    if (fundingSource) {
      const formatDate = (date: string | Date | undefined) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      setFormData({
        name: fundingSource.name,
        code: fundingSource.code || '',
        type: (fundingSource.type || 'BOND') as typeof formData.type,
        startDate: formatDate(fundingSource.startDate),
        endDate: formatDate(fundingSource.endDate),
      });
    }
  }, [fundingSource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.type) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.patch<FundingSource>(`/api/funding-sources/${fundingSource.id}`, {
        name: formData.name,
        code: formData.code || undefined,
        type: formData.type,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      });

      onSuccess(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to update funding source');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Funding Source</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Funding Source Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Funding Source Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2024 GO Bonds"
                required
              />
            </div>

            {/* Funding Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Funding Code
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., BOND24"
              />
            </div>

            {/* Funding Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {FUNDING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
