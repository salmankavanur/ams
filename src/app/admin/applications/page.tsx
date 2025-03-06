// src/app/admin/applications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Application, Department } from '@/types/mongo';

export default function ApplicationsPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalApplications, setTotalApplications] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [departmentFilter, setDepartmentFilter] = useState(searchParams.get('departmentId') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  
  const limit = 10;
  
  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    // If user is not an admin, redirect to user dashboard
    if (!loading && userData && userData.role !== 'admin') {
      router.push('/dashboard/user');
    }
    
    if (user && userData?.role === 'admin') {
      fetchDepartments();
      fetchApplications();
    }
  }, [user, userData, loading, router, currentPage, statusFilter, departmentFilter, searchTerm]);
  
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      
      const data = await response.json();
      setDepartments(data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };
  
  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let url = `/api/applications?page=${currentPage}&limit=${limit}`;
      
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      if (departmentFilter) {
        url += `&departmentId=${departmentFilter}`;
      }
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await response.json();
      setApplications(data.applications);
      setTotalApplications(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    
    // Update URL with current filters
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (departmentFilter) params.set('departmentId', departmentFilter);
    if (searchTerm) params.set('search', searchTerm);
    
    router.push(`/admin/applications?${params.toString()}`);
  };
  
  const clearFilters = () => {
    setStatusFilter('');
    setDepartmentFilter('');
    setSearchTerm('');
    setCurrentPage(1);
    router.push('/admin/applications');
  };
  
  // Function to get application status text
  const getStatusText = (application: Application): { text: string; color: string } => {
    if (application.status.isApproved) {
      if (application.status.isQualified) {
        return { text: 'Qualified', color: 'text-green-800 bg-green-100' };
      }
      if (application.status.isQualified === false && application.status.reviewedAt) {
        return { text: 'Disqualified', color: 'text-red-800 bg-red-100' };
      }
      return { text: 'Approved', color: 'text-green-800 bg-green-100' };
    } else {
      if (application.status.reviewedAt) {
        return { text: 'Disapproved', color: 'text-red-800 bg-red-100' };
      }
      return { text: 'Pending', color: 'text-yellow-800 bg-yellow-100' };
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
          <div className="flex space-x-2">
            <Button onClick={() => fetchApplications()}>
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="disapproved">Disapproved</option>
                  <option value="qualified">Qualified</option>
                  <option value="disqualified">Disqualified</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept._id?.toString()} value={dept._id?.toString()}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  placeholder="Search by name, application no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-end space-x-2">
                <Button type="submit">
                  Search
                </Button>
                
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </form>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <h2 className="text-lg font-medium text-red-800">Error</h2>
            <p className="mt-1 text-red-700">{error}</p>
            <Button
              className="mt-2"
              onClick={fetchApplications}
            >
              Retry
            </Button>
          </div>
        )}
        
        {/* Results */}
        {applications.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-500 mb-4">
              Try changing your search criteria or clearing filters
            </p>
            <Button onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white shadow rounded-lg overflow-hidden mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application No
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied On
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => {
                    const status = getStatusText(application);
                    const departmentName = application.status.departmentId
                      ? departments.find(d => d._id?.toString() === application.status.departmentId)?.name || 'Unknown'
                      : 'Not Assigned';
                      
                    return (
                      <tr key={application._id?.toString()}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {application.applicationNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {application.personalInfo.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(application.status.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {departmentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/applications/${application._id}`}
                            className="text-primary hover:text-primary-dark"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{applications.length}</span> of{' '}
                <span className="font-medium">{totalApplications}</span> applications
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

