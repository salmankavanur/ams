// src/app/api/auth/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserByUid, createOrUpdateUser } from '@/lib/db-helpers';
import { verifyAuth } from '@/lib/auth-helpers';
import { UserModel } from '@/types/mongo';

// Get user by UID
export async function GET(req: NextRequest) {
  try {
    // Get the UID from query parameters
    const url = new URL(req.url);
    const uid = url.searchParams.get('uid');
    
    if (!uid) {
      return NextResponse.json(
        { error: 'UID is required' },
        { status: 400 }
      );
    }
    
    // Get user from MongoDB
    const user = await getUserByUid(uid);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

// Create or update user
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.uid || !data.phoneNumber) {
      return NextResponse.json(
        { error: 'UID and phone number are required' },
        { status: 400 }
      );
    }
    
    // Check if this is an update request
    const authResult = await verifyAuth(req);
    const isAuthenticated = authResult.isAuthenticated;
    const isAdmin = isAuthenticated && authResult.role === 'admin';
    
    // For existing users, only allow role changes by admins
    if (isAuthenticated && !isAdmin && data.role) {
      const existingUser = await getUserByUid(data.uid);
      if (existingUser && existingUser.role !== data.role) {
        return NextResponse.json(
          { error: 'Only admins can change user roles' },
          { status: 403 }
        );
      }
    }
    
    // Create or update user
    const user: UserModel = {
      uid: data.uid,
      phoneNumber: data.phoneNumber,
      role: data.role || 'user',
      displayName: data.displayName || null,
      photoURL: data.photoURL || null,
      email: data.email || null,
      createdAt: data.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    
    const result = await createOrUpdateUser(user);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json(
      { error: 'Failed to create/update user' },
      { status: 500 }
    );
  }
}