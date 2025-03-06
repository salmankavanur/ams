// src/services/notification-service.ts
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { Notification } from '@/types/mongo';
import { updateNotificationStatus } from '@/lib/db-helpers';

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Email notification
export async function sendEmailNotification(notification: Notification, to: string): Promise<boolean> {
  try {
    if (!to) {
      await updateNotificationStatus(notification._id!.toString(), 'failed', {
        error: 'No recipient email provided'
      });
      return false;
    }
    
    const emailInfo = await emailTransporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Entrance Exam System'}" <${process.env.EMAIL_FROM}>`,
      to,
      subject: 'Entrance Examination 2025 - Notification',
      text: notification.message,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Entrance Examination 2025</h2>
        <p>${notification.message}</p>
        <hr />
        <p style="font-size: 12px; color: #666;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>`,
    });
    
    await updateNotificationStatus(notification._id!.toString(), 'sent', {
      emailId: emailInfo.messageId,
      sendTime: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    await updateNotificationStatus(notification._id!.toString(), 'failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}

// SMS notification
export async function sendSmsNotification(notification: Notification, to: string): Promise<boolean> {
  try {
    if (!twilioClient) {
      await updateNotificationStatus(notification._id!.toString(), 'failed', {
        error: 'Twilio client not initialized'
      });
      return false;
    }
    
    if (!to) {
      await updateNotificationStatus(notification._id!.toString(), 'failed', {
        error: 'No recipient phone number provided'
      });
      return false;
    }
    
    const message = await twilioClient.messages.create({
      body: notification.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    
    await updateNotificationStatus(notification._id!.toString(), 'sent', {
      smsId: message.sid,
      sendTime: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    await updateNotificationStatus(notification._id!.toString(), 'failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}

// WhatsApp notification
export async function sendWhatsAppNotification(notification: Notification, to: string): Promise<boolean> {
  try {
    if (!twilioClient) {
      await updateNotificationStatus(notification._id!.toString(), 'failed', {
        error: 'Twilio client not initialized'
      });
      return false;
    }
    
    if (!to) {
      await updateNotificationStatus(notification._id!.toString(), 'failed', {
        error: 'No recipient WhatsApp number provided'
      });
      return false;
    }
    
    // Format phone number for WhatsApp - must be in international format without '+' prefix
    const formattedTo = to.startsWith('+') ? to.substring(1) : to;
    
    const message = await twilioClient.messages.create({
      body: notification.message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedTo}`,
    });
    
    await updateNotificationStatus(notification._id!.toString(), 'sent', {
      whatsappId: message.sid,
      sendTime: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    await updateNotificationStatus(notification._id!.toString(), 'failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
}