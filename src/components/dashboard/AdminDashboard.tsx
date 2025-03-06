// src/components/dashboard/AdminDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/ui/Loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Application, Department } from '@/types/mongo';
import Link from 'next/link';

const AdminDashboard: React.FC = () => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    approved: number;
    disapproved: number;
    qualified: number;
    disqualified: number;
  } | null>(null);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch statistics
        const statsResponse = await fetch('/api/applications/stats');
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const statsData = await statsResponse.json();

        // Fetch recent applications
        const applicationsResponse = await fetch('/api/applications?limit=5');
        if (!applicationsResponse.ok) {
          throw new Error('Failed to fetch recent applications');
        }
        const applicationsData = await applicationsResponse.json();

        // Fetch departments
        const departmentsResponse = await fetch('/api/departments');
        if (!departmentsResponse.ok) {
          throw new Error('Failed to fetch departments');
        }
        const departmentsData = await departmentsResponse.json();

        setStats(statsData);
        setRecentApplications(applicationsData.applications);
        setDepartments(departmentsData.departments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-8 bg-red-50 p-6 rounded-xl shadow-md border border-red-100">
        <div className="text-red-700 font-semibold text-lg">Error loading dashboard data</div>
        <p className="text-red-500 mt-2">{error}</p>
        <button
          className="mt-4 px-5 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Prepare chart data
  const chartData = stats
    ? [
        {
          name: 'Applications',
          Total: stats.total,
          Approved: stats.approved,
          Disapproved: stats.disapproved,
          Qualified: stats.qualified,
          Disqualified: stats.disqualified,
        },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-8 py-6">
          <h3 className="text-xl font-bold text-white">
            Admin Dashboard
          </h3>
          <p className="mt-1 text-indigo-100">
            Welcome to the administrator control panel.
          </p>
        </div>
        
        <div className="p-8">
          {/* Account Information */}
          <div className="mb-10">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Account Information
            </h4>
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-indigo-600 font-medium mb-1">User ID</p>
                  <p className="font-semibold text-gray-800">{userData?.uid || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-600 font-medium mb-1">Phone Number</p>
                  <p className="font-semibold text-gray-800">
                    {userData?.phoneNumber || 'Not available'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-indigo-600 font-medium mb-1">Role</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                    {userData?.role || 'admin'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Analytics Dashboard */}
          <div className="mb-10">
            <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Application Analytics
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl shadow-sm border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-blue-900">{stats?.total || 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl shadow-sm border border-green-200">
                <p className="text-sm text-green-700 font-medium mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-900">{stats?.approved || 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl shadow-sm border border-red-200">
                <p className="text-sm text-red-700 font-medium mb-1">Disapproved</p>
                <p className="text-3xl font-bold text-red-900">{stats?.disapproved || 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl shadow-sm border border-purple-200">
                <p className="text-sm text-purple-700 font-medium mb-1">Qualified</p>
                <p className="text-3xl font-bold text-purple-900">{stats?.qualified || 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl shadow-sm border border-orange-200">
                <p className="text-sm text-orange-700 font-medium mb-1">Disqualified</p>
                <p className="text-3xl font-bold text-orange-900">{stats?.disqualified || 0}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '8px',
                      borderColor: '#e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Legend wrapperStyle={{ paddingTop: 15 }} />
                  <Bar dataKey="Total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Disapproved" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Qualified" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Disqualified" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Recent Applications */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Recent Applications
              </h4>
              <Link
                href="/admin/applications"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                View all
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            {recentApplications.length > 0 ? (
              <div className="overflow-x-auto rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Application No
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Applied On
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentApplications.map((application) => (
                      <tr key={application._id?.toString()} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {application.applicationNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {application.personalInfo.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            application.status.isApproved
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {application.status.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(application.status.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/applications/${application._id}`}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100 transition"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center text-gray-500 border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No applications found</p>
                <p className="mt-1">New applications will appear here</p>
              </div>
            )}
          </div>
          
          {/* Departments */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Departments
              </h4>
              <Link
                href="/admin/departments"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                Manage Departments
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            {departments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {departments.map((department) => (
                  <div
                    key={department._id?.toString()}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-semibold text-gray-800 text-lg mb-2 group-hover:text-indigo-700 transition">{department.name}</h5>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 font-medium">
                          {department.code}
                        </span>
                      </div>
                      <Link
                        href={`/admin/departments/${department._id}`}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center text-gray-500 border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-lg font-medium">No departments found</p>
                <p className="mt-1">Create departments to organize applications</p>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Quick Actions
            </h4>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/applications/new"
                className="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Application
              </Link>
              <Link
                href="/admin/departments/new"
                className="inline-flex items-center px-4 py-2.5 bg-white text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
                Add Department
              </Link>
              <Link
                href="/admin/notifications"
                className="inline-flex items-center px-4 py-2.5 bg-white text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Send Notifications
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;