// src/types/mongo.ts
import { ObjectId } from 'mongodb';

// User model with extended properties from the existing UserData
export interface UserModel {
  _id?: ObjectId;
  uid: string; // Firebase UID
  phoneNumber: string | null;
  role: 'admin' | 'user' | null;
  displayName?: string | null;
  photoURL?: string | null;
  email?: string | null;
  createdAt: number;
  updatedAt: number;
}

// Application model for form submissions
export interface Application {
  _id?: ObjectId;
  applicationNo: string; // Auto-generated unique ID
  userId: string; // Reference to Firebase UID
  personalInfo: {
    name: string;
    fatherName: string;
    motherName: string;
    guardianName: string;
    dateOfBirth: string;
    photo: string; // URL or Base64 encoded string
  };
  addressInfo: {
    place: string;
    mahallu: string;
    postOffice: string;
    pinCode: string;
    panchayath: string;
    constituency: string;
    district: string;
    state: string;
  };
  contactInfo: {
    mobileNumber: string;
    candidateMobile: string;
    whatsappNumber: string;
    email: string;
  };
  educationalInfo: {
    madrasa: string;
    school: string;
    regNo: string;
    medium: string;
    hifzCompleted: boolean;
  };
  paymentInfo: {
    transactionId: string;
    amount: number;
    date: string;
    status: 'pending' | 'completed' | 'failed';
  };
  status: {
    isApproved: boolean;
    isQualified: boolean;
    departmentId?: string;
    appliedAt: number;
    updatedAt: number;
    reviewedBy?: string;
    reviewedAt?: number;
  };
  examInfo?: {
    centerName?: string;
    examDate?: string;
    examTime?: string;
    hallTicketIssued?: boolean;
    hallTicketIssuedAt?: number;
  };
}

// Department model
export interface Department {
  _id?: ObjectId;
  name: string;
  code: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

// Notification model
export interface Notification {
  _id?: ObjectId;
  userId: string;
  type: 'sms' | 'email' | 'whatsapp';
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sendAt: number;
  sentAt?: number;
  metadata?: Record<string, any>;
}

// Counter model for sequential application numbers
export interface Counter {
  _id?: ObjectId;
  name: string;
  sequence: number;
}