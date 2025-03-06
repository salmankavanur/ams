// src/components/admin/ApplicationManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { Application, Department } from '@/types/mongo';
import Link from 'next/link';

interface ApplicationManagementProps {
  applicationId: string;
}

const ApplicationManagement: React.FC<ApplicationManagementProps> = ({ applicationId }) => {
  const router = useRouter();
  
  const [application, setApplication] = useState<Application | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'email' | 'sms' | 'whatsapp'>('email');

  // Fetch application and departments data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch application
        const applicationResponse = await fetch(`/api/applications/${applicationId}`);
        if (!applicationResponse.ok) {
          throw new Error('Failed to fetch application details');
        }
        const applicationData = await applicationResponse.json();
        setApplication(applicationData);
        
        if (applicationData.status.departmentId) {
          setSelectedDepartment(applicationData.status.departmentId);
        }
        
        // Fetch departments
        const departmentsResponse = await fetch('/api/departments');
        if (!departmentsResponse.ok) {
          throw new Error('Failed to fetch departments');
        }
        const departmentsData = await departmentsResponse.json();
        setDepartments(departmentsData.departments);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [applicationId]);

  // Handle application status update
  const updateApplicationStatus = async (updates: Partial<Application>) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
      
      const updatedApplication = await response.json();
      setApplication(updatedApplication);
      
      return true;
    } catch (error) {
      console.error('Error updating application:', error);
      alert('An error occurred while updating the application. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle approve/disapprove
  const handleApprovalUpdate = async (isApproved: boolean) => {
    const success = await updateApplicationStatus({
      status: {
        ...application?.status,
        isApproved,
        reviewedAt: Date.now(),
        reviewedBy: 'admin', // In a real app, use the current admin's ID
      },
    });
    
    if (success) {
      alert(`Application ${isApproved ? 'approved' : 'disapproved'} successfully.`);
    }
  };

  // Handle qualify/disqualify
  const handleQualificationUpdate = async (isQualified: boolean) => {
    const success = await updateApplicationStatus({
      status: {
        ...application?.status,
        isQualified,
        reviewedAt: Date.now(),
        reviewedBy: 'admin',
      },
    });
    
    if (success) {
      alert(`Applicant ${isQualified ? 'qualified' : 'disqualified'} successfully.`);
    }
  };

  // Handle department assignment
  const handleDepartmentAssignment = async () => {
    if (!selectedDepartment) {
      alert('Please select a department.');
      return;
    }
    
    const success = await updateApplicationStatus({
      status: {
        ...application?.status,
        departmentId: selectedDepartment,
        updatedAt: Date.now(),
      },
    });
    
    if (success) {
      alert('Department assigned successfully.');
    }
  };

  // Handle exam details update
  const handleExamDetailsUpdate = async (examInfo: Partial<Application['examInfo']>) => {
    const success = await updateApplicationStatus({
      examInfo: {
        ...application?.examInfo,
        ...examInfo,
      },
    });
    
    if (success) {
      alert('Exam details updated successfully.');
      
      // Check if hall ticket should be marked as issued
      if (examInfo.examDate || examInfo.examTime) {
        await updateApplicationStatus({
          examInfo: {
            ...application?.examInfo,
            ...examInfo,
            hallTicketIssued: true,
            hallTicketIssuedAt: Date.now(),
          },
        });
      }
    }
  };

  // Handle notification sending
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notificationMessage.trim()) {
      alert('Please enter a notification message.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: application?.userId,
          type: notificationType,
          message: notificationMessage,
          metadata: {
            applicationId: applicationId,
            applicationNo: application?.applicationNo,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      
      alert('Notification sent successfully.');
      setShowNotificationForm(false);
      setNotificationMessage('');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700 font-medium">Error loading application</div>
        <p className="text-red-500 mt-1">{error || 'Application not found'}</p>
        <button
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
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
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    application.status.isApproved 
                      ? 'bg-green-100 text-green-800' 
                      : application.status.reviewedAt 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {application.status.isApproved 
                      ? 'Approved' 
                      : application.status.reviewedAt 
                        ? 'Disapproved' 
                        : 'Pending'}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Qualification</p>
                <div className="mt-1">
                  {application.status.reviewedAt ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      application.status.isQualified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {application.status.isQualified ? 'Qualified' : 'Disqualified'}
                    </span>
                  ) : (
                    <span className="text-gray-500">Not reviewed yet</span>
                  )}
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
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button className='bg-black '
              onClick={() => handleApprovalUpdate(true)}
              disabled={isSubmitting || application.status.isApproved}
              variant={application.status.isApproved ? 'outline' : 'primary'}
            >
              Approve
            </Button>
            
            <Button
              onClick={() => handleApprovalUpdate(false)}
              disabled={isSubmitting || (application.status.reviewedAt && !application.status.isApproved)}
              variant={!application.status.isApproved && application.status.reviewedAt ? 'outline' : 'secondary'}
            >
              Disapprove
            </Button>
            
            {application.status.isApproved && (
              <>
                <Button className='bg-black text-white'
                  onClick={() => handleQualificationUpdate(true)}
                  disabled={isSubmitting || application.status.isQualified}
                  variant={application.status.isQualified ? 'outline' : 'primary'}
                >
                  Qualify
                </Button>
                
                <Button
                  onClick={() => handleQualificationUpdate(false)}
                  disabled={isSubmitting || (application.status.reviewedAt && application.status.isQualified === false)}
                  variant={application.status.isQualified === false ? 'outline' : 'secondary'}
                >
                  Disqualify
                </Button>
              </>
            )}
            
            <Button
              onClick={() => setShowNotificationForm(!showNotificationForm)}
              variant="outline"
              disabled={isSubmitting}
            >
              Send Notification
            </Button>
          </div>
          
          {showNotificationForm && (
            <div className="mt-4 border border-gray-200 rounded-md p-4">
              <h5 className="font-medium mb-2">Send Notification</h5>
              <form onSubmit={handleSendNotification}>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Type
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value as any)}
                    disabled={isSubmitting}
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
                
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    rows={3}
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Enter notification message..."
                    disabled={isSubmitting}
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-2 mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowNotificationForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Send
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        {/* Department Assignment */}
        <div className="mb-8">
          <h4 className="text-base font-medium text-gray-800 mb-4">
            Department Assignment
          </h4>
          
          {departments.length > 0 ? (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-end space-x-2">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to Department
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id?.toString()} value={dept._id?.toString()}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button
                  onClick={handleDepartmentAssignment}
                  disabled={isSubmitting || !selectedDepartment}
                >
                  Assign
                </Button>
              </div>
              
              {application.status.departmentId && (
                <div className="mt-2 text-sm text-gray-500">
                  Currently assigned to: {
                    departments.find(d => d._id?.toString() === application.status.departmentId)?.name || 'Unknown Department'
                  }
                </div>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-yellow-700">No departments available. Please create departments first.</p>
              <Link href="/admin/departments/new" className="text-yellow-600 underline mt-1 inline-block">
                Create Department
              </Link>
            </div>
          )}
        </div>
        
        {/* Exam Details */}
        {application.status.isApproved && (
          <div className="mb-8">
            <h4 className="text-base font-medium text-gray-800 mb-4">
              Examination Details
            </h4>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    value={application.examInfo?.examDate || ''}
                    onChange={(e) => handleExamDetailsUpdate({ examDate: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Time
                  </label>
                  <input
                    type="time"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    value={application.examInfo?.examTime || ''}
                    onChange={(e) => handleExamDetailsUpdate({ examTime: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Center
                  </label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    value={application.examInfo?.centerName || ''}
                    onChange={(e) => handleExamDetailsUpdate({ centerName: e.target.value })}
                    placeholder="Enter exam center name"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="flex items-center h-full pt-6">
                  <div className="flex items-center">
                    <input
                      id="hall-ticket-issued"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={application.examInfo?.hallTicketIssued || false}
                      onChange={(e) => handleExamDetailsUpdate({ hallTicketIssued: e.target.checked })}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="hall-ticket-issued" className="ml-2 block text-sm text-gray-700">
                      Hall Ticket Issued
                    </label>
                  </div>
                </div>
              </div>
              
              {application.examInfo?.hallTicketIssued && application.examInfo?.hallTicketIssuedAt && (
                <div className="mt-2 text-sm text-gray-500">
                  Hall ticket issued on: {new Date(application.examInfo.hallTicketIssuedAt).toLocaleDateString()}
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
        
        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Back to List
          </Button>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationManagement;