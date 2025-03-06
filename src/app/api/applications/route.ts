// src/app/api/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  createApplication, 
  getAllApplications, 
  getApplicationsByUserId 
} from '@/lib/db-helpers';
import { verifyAuth } from '@/lib/auth-helpers';
import { Application } from '@/types/mongo';

// Create a new application
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.personalInfo?.name || !data.contactInfo?.mobileNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Set user ID from authenticated user
    const application: Application = {
      ...data,
      userId: authResult.uid,
      status: {
        isApproved: false,
        isQualified: false,
        appliedAt: Date.now(),
        updatedAt: Date.now(),
      }
    };
    
    const createdApplication = await createApplication(application);
    
    return NextResponse.json(createdApplication, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

// Get all applications (admin only) or user's applications
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
    
    // Get query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Check if admin or regular user
    if (authResult.role === 'admin') {
      // Admin can see all applications with filters
      const status = url.searchParams.get('status'); // approved, disapproved, qualified, disqualified
      const departmentId = url.searchParams.get('departmentId');
      const searchTerm = url.searchParams.get('search');
      
      // Build filters
      const filters: Record<string, any> = {};
      
      if (status === 'approved') {
        filters['status.isApproved'] = true;
      } else if (status === 'disapproved') {
        filters['status.isApproved'] = false;
        filters['status.reviewedAt'] = { $exists: true };
      } else if (status === 'qualified') {
        filters['status.isQualified'] = true;
      } else if (status === 'disqualified') {
        filters['status.isQualified'] = false;
        filters['status.reviewedAt'] = { $exists: true };
      }
      
      if (departmentId) {
        filters['status.departmentId'] = departmentId;
      }
      
      if (searchTerm) {
        filters['$or'] = [
          { applicationNo: { $regex: searchTerm, $options: 'i' } },
          { 'personalInfo.name': { $regex: searchTerm, $options: 'i' } },
          { 'contactInfo.mobileNumber': { $regex: searchTerm, $options: 'i' } },
          { 'contactInfo.email': { $regex: searchTerm, $options: 'i' } }
        ];
      }
      
      const { applications, total } = await getAllApplications(filters, page, limit);
      
      return NextResponse.json({
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } else {
      // Regular users can only see their own applications
      const applications = await getApplicationsByUserId(authResult.uid);
      
      return NextResponse.json({ applications });
    }
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}