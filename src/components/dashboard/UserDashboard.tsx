// src/components/dashboard/UserDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import { Application } from '@/types/mongo';
import Link from 'next/link';

const UserDashboard: React.FC = () => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/applications');
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }

        const data = await response.json();
        setApplications(data.applications);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          User Dashboard
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your personal dashboard.
        </p>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <h4 className="text-base font-medium text-gray-800 mb-2">
            Profile Information
          </h4>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium">{userData?.uid || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">
                  {userData?.phoneNumber || 'Not available'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {userData?.role || 'user'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-base font-medium text-gray-800">
              Your Applications
            </h4>
            <Link href="/application/new">
              <Button size="sm">Apply Now</Button>
            </Link>
          </div>
          
          {error && (
            <div className="bg-red-50 p-4 rounded-md mb-4">
              <p className="text-red-700">{error}</p>
              <button
                className="mt-2 text-sm text-red-700 underline"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}
          
          {applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application No
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied On
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => {
                    const status = getStatusText(application);
                    return (
                      <tr key={application._id?.toString()}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {application.applicationNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(application.status.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link 
                              href={`/applications/${application._id}/view`}
                              className="text-primary hover:text-primary-dark"
                            >
                              View
                            </Link>
                            <Link 
                              href={`/api/pdf/application/${application._id}`}
                              className="text-primary hover:text-primary-dark"
                              target="_blank"
                            >
                              Download
                            </Link>
                            {application.status.isApproved && (
                              <Link 
                                href={`/api/pdf/hall-ticket/${application._id}`}
                                className="text-primary hover:text-primary-dark"
                                target="_blank"
                              >
                                Hall Ticket
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-md p-8 text-center">
              <p className="text-gray-500 mb-4">You haven't submitted any applications yet.</p>
              <Link href="/applications/new">
                <Button className='bg-black text-white'>Apply Now</Button>
              </Link>
            </div>
          )}
        </div>
        
        <div>
          <h4 className="text-base font-medium text-gray-800 mb-2">
            Entrance Exam Information
          </h4>
          <div className="bg-blue-50 p-4 rounded-md">
            <h5 className="font-medium text-blue-800 mb-2">Important Dates:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>Application Submission Deadline: 31 March, 2025</li>
              <li>Entrance Examination Date: 15 April, 2025</li>
              <li>Results Announcement: 30 April, 2025</li>
            </ul>
            <p className="text-sm text-blue-600 mt-2">
              Make sure to download your Hall Ticket once your application is approved.
            </p>
          </div>
        </div>
        
        <div className="mt-8">
          <h4 className="text-base font-medium text-gray-800 mb-2">
            Quick Links
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/applications/new">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer">
                <h5 className="font-medium mb-1">New Application</h5>
                <p className="text-sm text-gray-500">
                  Apply for the entrance examination
                </p>
              </div>
            </Link>
            <Link href="/profile">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer">
                <h5 className="font-medium mb-1">Update Profile</h5>
                <p className="text-sm text-gray-500">
                  Manage your account information
                </p>
              </div>
            </Link>
            <Link href="/help">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer">
                <h5 className="font-medium mb-1">Help Center</h5>
                <p className="text-sm text-gray-500">
                  Get help and support
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;