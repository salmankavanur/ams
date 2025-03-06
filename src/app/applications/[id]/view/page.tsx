// src/app/application/[id]/view/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Application } from '@/types/mongo';

export default function ViewApplicationPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    // Fetch application details
    const fetchApplication = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/applications/${applicationId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch application details');
        }
        
        const data = await response.json();
        setApplication(data);
        
        // Check if user is authorized to view this application
        if (userData?.role !== 'admin' && data.userId !== user?.uid) {
          throw new Error('You are not authorized to view this application');
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && applicationId) {
      fetchApplication();
    }
  }, [user, userData, loading, applicationId, router]);
  
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
  
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => router.push('/dashboard/user')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  if (!application) {
    return null;
  }
  
  const status = getStatusText(application);
  
  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Application Details
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Application #{application.applicationNo}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Link 
              href={`/api/pdf/application/${applicationId}`} 
              target="_blank"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Download PDF
            </Link>
            
            {application.status.isApproved && (
              <Link 
                href={`/api/pdf/hall-ticket/${applicationId}`} 
                target="_blank"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Hall Ticket
              </Link>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {/* Application Status Section */}
          <div className="mb-8">
            <h4 className="text-base font-medium text-gray-800 mb-4">
              Application Status
            </h4>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Applied On</p>
                  <p className="font-medium">
                    {new Date(application.status.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {new Date(application.status.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                
                {application.status.departmentId && (
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">Assigned</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Exam Information (if approved) */}
          {application.status.isApproved && application.examInfo && (
            <div className="mb-8">
              <h4 className="text-base font-medium text-gray-800 mb-4">
                Examination Details
              </h4>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-600">Exam Date</p>
                    <p className="font-medium text-blue-900">
                      {application.examInfo.examDate || 'To be announced'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-blue-600">Exam Time</p>
                    <p className="font-medium text-blue-900">
                      {application.examInfo.examTime || 'To be announced'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-blue-600">Exam Center</p>
                    <p className="font-medium text-blue-900">
                      {application.examInfo.centerName || 'To be announced'}
                    </p>
                  </div>
                </div>
                
                {application.examInfo.hallTicketIssued && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-blue-700">
                      Your hall ticket has been issued. You can download it from the link above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Personal Information */}
          <div className="mb-8">
            <h4 className="text-base font-medium text-gray-800 mb-4">
              Personal Information
            </h4>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{application.personalInfo.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{application.personalInfo.dateOfBirth}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Father's Name</p>
                  <p className="font-medium">{application.personalInfo.fatherName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Mother's Name</p>
                  <p className="font-medium">{application.personalInfo.motherName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Guardian's Name</p>
                  <p className="font-medium">{application.personalInfo.guardianName || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Photo</p>
                  {application.personalInfo.photo ? (
                    <div className="mt-1 h-24 w-20 border rounded overflow-hidden">
                      <img
                        src={application.personalInfo.photo}
                        alt="Applicant"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <p>No photo provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="mb-8">
            <h4 className="text-base font-medium text-gray-800 mb-4">
              Contact Information
            </h4>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500">Mobile Number</p>
                  <p className="font-medium">{application.contactInfo.mobileNumber}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Candidate's Mobile</p>
                  <p className="font-medium">{application.contactInfo.candidateMobile}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">WhatsApp Number</p>
                  <p className="font-medium">{application.contactInfo.whatsappNumber || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{application.contactInfo.email}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Address Information */}
          <div className="mb-8">
            <h4 className="text-base font-medium text-gray-800 mb-4">
              Address Information
            </h4>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500">Place</p>
                  <p className="font-medium">{application.addressInfo.place}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Mahallu</p>
                  <p className="font-medium">{application.addressInfo.mahallu || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Post Office</p>
                  <p className="font-medium">{application.addressInfo.postOffice}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">PIN Code</p>
                  <p className="font-medium">{application.addressInfo.pinCode}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Panchayath</p>
                  <p className="font-medium">{application.addressInfo.panchayath || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Constituency</p>
                  <p className="font-medium">{application.addressInfo.constituency || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">District</p>
                  <p className="font-medium">{application.addressInfo.district}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">State</p>
                  <p className="font-medium">{application.addressInfo.state}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Educational Information */}
          <div className="mb-8">
            <h4 className="text-base font-medium text-gray-800 mb-4">
              Educational Information
            </h4>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500">Madrasa</p>
                  <p className="font-medium">{application.educationalInfo.madrasa || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">School</p>
                  <p className="font-medium">{application.educationalInfo.school}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Registration No.</p>
                  <p className="font-medium">{application.educationalInfo.regNo}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Medium</p>
                  <p className="font-medium">{application.educationalInfo.medium}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Hifz Completed</p>
                  <p className="font-medium">{application.educationalInfo.hifzCompleted ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Information */}
          <div className="mb-8">
            <h4 className="text-base font-medium text-gray-800 mb-4">
              Payment Information
            </h4>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium">{application.paymentInfo.transactionId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">₹{application.paymentInfo.amount.toFixed(2)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{new Date(application.paymentInfo.date).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      application.paymentInfo.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : application.paymentInfo.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {application.paymentInfo.status.charAt(0).toUpperCase() + application.paymentInfo.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Back Button */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/user')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}