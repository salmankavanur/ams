// src/app/api/applications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  getApplicationById, 
  updateApplication, 
  getUserByUid,
  createNotification
} from '@/lib/db-helpers';
import { verifyAuth } from '@/lib/auth-helpers';
import { Application } from '@/types/mongo';

interface RouteParams {
  params: {
    id: string;
  }
}

// Get a specific application
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    console.log("Getting application by ID:", params.id);
    const applicationId = params.id;
    const application = await getApplicationById(applicationId);
    
    if (!application) {
      console.error("Application not found for ID:", applicationId);
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to view this application
    const isAdmin = authResult.role === 'admin';
    const isOwner = application.userId === authResult.uid;
    
    if (!isAdmin && !isOwner) {
      console.error("Unauthorized access attempt. User:", authResult.uid, "Application owner:", application.userId);
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

// Update a specific application
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    const applicationId = params.id;
    const application = await getApplicationById(applicationId);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to update this application
    const isAdmin = authResult.role === 'admin';
    const isOwner = application.userId === authResult.uid;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const updates = await req.json();
    
    // Restrict what regular users can update
    if (!isAdmin) {
      // Regular users can only update certain fields
      const { personalInfo, addressInfo, contactInfo, educationalInfo } = updates;
      const allowedUpdates: Partial<Application> = {};
      
      // Only allow updates if the application is not yet approved
      if (application.status.isApproved) {
        return NextResponse.json(
          { error: 'Cannot update approved application' },
          { status: 403 }
        );
      }
      
      if (personalInfo) allowedUpdates.personalInfo = personalInfo;
      if (addressInfo) allowedUpdates.addressInfo = addressInfo;
      if (contactInfo) allowedUpdates.contactInfo = contactInfo;
      if (educationalInfo) allowedUpdates.educationalInfo = educationalInfo;
      
      // Update the application with restricted fields
      const updatedApplication = await updateApplication(applicationId, allowedUpdates);
      return NextResponse.json(updatedApplication);
    }
    
    // Admins can update any field
    const updatedApplication = await updateApplication(applicationId, updates);
    
    // Check if approval status has changed
    const oldStatus = application.status.isApproved;
    const newStatus = updatedApplication?.status?.isApproved;
    
    if (oldStatus !== newStatus && updatedApplication) {
      // Get the user to notify
      const user = await getUserByUid(application.userId);
      
      if (user) {
        // Create notification for approval change
        const statusText = newStatus ? 'approved' : 'disapproved';
        await createNotification({
          userId: application.userId,
          type: 'email',
          message: `Your application ${application.applicationNo} has been ${statusText}.`,
          status: 'pending',
          sendAt: Date.now(),
          metadata: {
            applicationId: applicationId,
            applicationNo: application.applicationNo,
            statusChange: {
              from: oldStatus,
              to: newStatus
            }
          }
        });
        
        // Create SMS notification
        if (user.phoneNumber) {
          await createNotification({
            userId: application.userId,
            type: 'sms',
            message: `Your application ${application.applicationNo} has been ${statusText}.`,
            status: 'pending',
            sendAt: Date.now(),
            metadata: {
              phoneNumber: user.phoneNumber,
              applicationId: applicationId,
              applicationNo: application.applicationNo
            }
          });
        }
      }
    }
    
    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}