// src/app/api/departments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  createDepartment, 
  getAllDepartments 
} from '@/lib/db-helpers';
import { verifyAuth } from '@/lib/auth-helpers';
import { Department } from '@/types/mongo';

// Create a new department (admin only)
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
    if (!data.name || !data.code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const department: Department = {
      name: data.name,
      code: data.code,
      description: data.description || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    const createdDepartment = await createDepartment(department);
    
    return NextResponse.json(createdDepartment, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}

// Get all departments
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
    
    const departments = await getAllDepartments();
    
    return NextResponse.json({ departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}