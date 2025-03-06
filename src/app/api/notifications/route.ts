// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  createNotification, 
  getNotificationsByUserId,
  getUserByUid,
  getPendingNotifications
} from '@/lib/db-helpers';
import { verifyAuth } from '@/lib/auth-helpers';
import { 
  sendEmailNotification, 
  sendSmsNotification, 
  sendWhatsAppNotification 
} from '@/services/notification-service';
import { Notification } from '@/types/mongo';

// Create a new notification (admin only)
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
    
    // Check if user is admin
    if (authResult.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.userId || !data.type || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get user info to check if contact information exists
    const user = await getUserByUid(data.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create notification
    const notification: Notification = {
      userId: data.userId,
      type: data.type,
      message: data.message,
      status: 'pending',
      sendAt: data.sendAt || Date.now(),
      metadata: data.metadata || {},
    };
    
    const createdNotification = await createNotification(notification);
    
    // Process notification immediately if no future send date
    if (notification.sendAt <= Date.now()) {
      let success = false;
      
      if (notification.type === 'email' && user.email) {
        success = await sendEmailNotification(
          createdNotification, 
          user.email
        );
      } else if (notification.type === 'sms' && user.phoneNumber) {
        success = await sendSmsNotification(
          createdNotification, 
          user.phoneNumber
        );
      } else if (notification.type === 'whatsapp' && user.phoneNumber) {
        success = await sendWhatsAppNotification(
          createdNotification, 
          user.phoneNumber
        );
      }
      
      return NextResponse.json({
        notification: createdNotification,
        sent: success
      }, { status: 201 });
    }
    
    return NextResponse.json(createdNotification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// Get notifications
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
    
    // Parse query parameters
    const url = new URL(req.url);
    const pending = url.searchParams.get('pending') === 'true';
    const userId = url.searchParams.get('userId');
    
    // Admin can fetch all pending notifications or user-specific notifications
    if (authResult.role === 'admin') {
      if (pending) {
        const notifications = await getPendingNotifications();
        return NextResponse.json({ notifications });
      } else if (userId) {
        const notifications = await getNotificationsByUserId(userId);
        return NextResponse.json({ notifications });
      }
    }
    
    // Regular users can only fetch their own notifications
    const notifications = await getNotificationsByUserId(authResult.uid!);
    
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}