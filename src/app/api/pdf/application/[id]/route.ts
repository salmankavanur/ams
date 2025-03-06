// src/app/api/pdf/application/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-helpers';
import { getApplicationById } from '@/lib/db-helpers';
import { generateApplicationFormPDF } from '@/services/pdf-service';

interface RouteParams {
  params: {
    id: string;
  }
}

// Generate application form PDF
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
    
    // Generate PDF
    const pdfBuffer = await generateApplicationFormPDF(application);
    
    // Return PDF for download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="application_${application.applicationNo}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating application PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}