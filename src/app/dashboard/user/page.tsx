'use client';

import React from 'react';
import UserDashboard from '@/components/dashboard/UserDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';

export default function UserDashboardPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  
  React.useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    // If user is an admin, redirect to admin dashboard
    if (!loading && userData && userData.role === 'admin') {
      router.push('/dashboard/admin');
    }
  }, [user, userData, loading, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }
  
  if (!user || !userData) {
    return null; // Will be redirected by the useEffect
  }
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <UserDashboard />
      </div>
    </div>
  );
}