'use client';

import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';

export default function LoginPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user && userData) {
      const dashboardPath = userData.role === 'admin' ? '/dashboard/admin' : '/dashboard/user';
      router.push(dashboardPath);
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (user && userData) {
    return null; // Redirect will happen via useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <LoginForm />
    </div>
  );
}