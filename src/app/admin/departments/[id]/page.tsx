// src/app/admin/departments/[id]/page.tsx
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DepartmentManagement from '@/components/admin/DepartmentManagement';
import Loader from '@/components/ui/Loader';

export default function EditDepartmentPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const departmentId = params.id as string;
  
  React.useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    // If user is not an admin, redirect to user dashboard
    if (!loading && userData && userData.role !== 'admin') {
      router.push('/dashboard/user');
    }
  }, [user, userData, loading, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }
  
  if (!user || !userData || userData.role !== 'admin') {
    return null; // Will be redirected by the useEffect
  }
  
  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <DepartmentManagement departmentId={departmentId} />
      </div>
    </div>
  );
}

