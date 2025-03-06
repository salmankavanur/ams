// src/app/api/pdf/hall-ticket/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-helpers';
import { getApplicationById } from '@/lib/db-helpers';
import { generateHallTicketPDF } from '@/services/pdf-service';

interface RouteParams {
  params: {
    id: string;
  }
}

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
    
    const applicationId = params.id;
    const application = await getApplicationById(applicationId);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is authorized to access this application
    const isAdmin = authResult.role === 'admin';
    const isOwner = application.userId === authResult.uid;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Check if the application is approved (only approved applications can have hall tickets)
    if (!application.status.isApproved && !isAdmin) {
      return NextResponse.json(
        { error: 'Hall ticket is only available for approved applications' },
        { status: 403 }
      );
    }
    
    // Generate PDF
    const pdfBuffer = await generateHallTicketPDF(application);
    
    // Return PDF for download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="hall_ticket_${application.applicationNo}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating hall ticket PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate hall ticket' },
      { status: 500 }
    );
  }
}