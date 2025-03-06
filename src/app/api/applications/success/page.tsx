// src/app/application/success/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Application } from '@/types/mongo';

export default function ApplicationSuccessPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('id');
  
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    // If no application ID, redirect to dashboard
    if (!applicationId) {
      router.push('/dashboard/user');
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
  }, [user, loading, applicationId, router]);
  
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
  
  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-lg shadow">
      <div className="text-center mb-6">
        <div className="bg-green-100 p-3 rounded-full inline-flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mt-4 text-gray-900">Application Submitted Successfully!</h1>
        <p className="text-gray-600 mt-2">
          Your application has been received and is currently under review.
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Application Number</p>
            <p className="font-medium text-lg">{application.applicationNo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Submitted on</p>
            <p className="font-medium">{new Date(application.status.appliedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <h3 className="font-medium text-gray-900">Next Steps:</h3>
        
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="bg-blue-100 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-gray-700">Your application will be reviewed by our administrators.</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="bg-blue-100 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-gray-700">You'll receive notification of approval status via email and SMS.</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="bg-blue-100 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-gray-700">Once approved, you'll be able to download your hall ticket for the entrance exam.</p>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-3 justify-center">
        <Link href={`/api/pdf/application/${applicationId}`} target="_blank">
          <Button>
            Download Application
          </Button>
        </Link>
        
        <Link href="/dashboard/user">
          <Button variant="outline">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

