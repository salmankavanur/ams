// src/app/api/applications/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getApplicationStats } from '@/lib/db-helpers';
import { verifyAuth } from '@/lib/auth-helpers';

// Get application statistics (admin only)
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    // Check if user is admin
    if (authResult.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const stats = await getApplicationStats();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application statistics' },
      { status: 500 }
    );
  }
}