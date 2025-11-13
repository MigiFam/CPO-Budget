import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { X } from 'lucide-react';
import { api } from '../lib/api';
import type { Facility } from '@cpo/types';

interface EditFacilityModalProps {
  facility: Facility;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (facility: Facility) => void;
}

const FACILITY_TYPES = [
  { value: 'ELEMENTARY', label: 'Elementary' },
  { value: 'MIDDLE', label: 'Middle School' },
  { value: 'HIGH_SCHOOL', label: 'High School' },
  { value: 'K8', label: 'K-8' },
  { value: 'ADMINISTRATIVE', label: 'Administrative' },
  { value: 'OTHER', label: 'Other' },
] as const;

export function EditFacilityModal({ facility, isOpen, onClose, onSuccess }: EditFacilityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'ELEMENTARY' as const,
    address: '',
    region: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when facility changes
  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name,
        code: facility.code || '',
        type: (facility.type || 'ELEMENTARY') as typeof formData.type,
        address: facility.address || '',
        region: facility.region || '',
      });
    }
  }, [facility]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.type) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.patch<Facility>(`/api/facilities/${facility.id}`, {
        name: formData.name,
        code: formData.code || undefined,
        type: formData.type,
        address: formData.address || undefined,
        region: formData.region || undefined,
      });

      onSuccess(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to update facility');
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
          <h2 className="text-xl font-bold text-gray-900">Edit Facility</h2>
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
            {/* Facility Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Lincoln High School"
                required
              />
            </div>

            {/* Facility Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility Code
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., LHS"
              />
            </div>

            {/* Facility Type */}
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
                {FACILITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 123 Main Street, City, State ZIP"
              />
            </div>

            {/* Region */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region/Jurisdiction
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Downtown District"
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
