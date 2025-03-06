// src/components/admin/DepartmentManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import { Department } from '@/types/mongo';

interface DepartmentFormData {
  name: string;
  code: string;
  description: string;
}

const initialFormData: DepartmentFormData = {
  name: '',
  code: '',
  description: '',
};

interface DepartmentManagementProps {
  departmentId?: string; // If provided, component works in edit mode
}

const DepartmentManagement: React.FC<DepartmentManagementProps> = ({ departmentId }) => {
  const router = useRouter();
  const isEditMode = !!departmentId;
  
  const [formData, setFormData] = useState<DepartmentFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch department data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchDepartment = async () => {
        try {
          setIsLoading(true);
          
          const response = await fetch(`/api/departments/${departmentId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch department');
          }
          
          const department: Department = await response.json();
          
          setFormData({
            name: department.name,
            code: department.code,
            description: department.description,
          });
        } catch (error) {
          console.error('Error fetching department:', error);
          alert('Failed to load department data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDepartment();
    }
  }, [departmentId, isEditMode]);

  const handleInputChange = (field: keyof DepartmentFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Department code is required';
    } else if (!/^[A-Z0-9]{2,10}$/.test(formData.code)) {
      newErrors.code = 'Code must be 2-10 uppercase letters or numbers';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const url = isEditMode
        ? `/api/departments/${departmentId}`
        : '/api/departments';
      
      const method = isEditMode ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} department`);
      }
      
      // Redirect to departments list
      router.push('/admin/departments');
      router.refresh();
    } catch (error) {
      console.error('Error submitting department:', error);
      alert(`An error occurred while ${isEditMode ? 'updating' : 'creating'} the department. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete department');
      }
      
      // Redirect to departments list
      router.push('/admin/departments');
      router.refresh();
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('An error occurred while deleting the department. Please try again.');
    } finally {
      setIsSubmitting(false);
      setConfirmDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">
        {isEditMode ? 'Edit Department' : 'Add New Department'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Department Name"
            placeholder="Enter department name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            required
          />
          
          <Input
            label="Department Code"
            placeholder="Enter department code (e.g., CS, ENG)"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
            error={errors.code}
            required
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              rows={4}
              placeholder="Enter department description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <div className="flex space-x-2">
            {isEditMode && (
              <Button
                type="button"
                variant={confirmDelete ? 'primary' : 'secondary'}
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {confirmDelete ? 'Confirm Delete' : 'Delete'}
              </Button>
            )}
            
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEditMode ? 'Update Department' : 'Create Department'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DepartmentManagement;