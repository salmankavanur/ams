// src/app/api/departments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  getDepartmentById, 
  updateDepartment,
  deleteDepartment
} from '@/lib/db-helpers';
import { verifyAuth } from '@/lib/auth-helpers';

interface RouteParams {
  params: {
    id: string;
  }
}

// Get a specific department
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
    
    const departmentId = params.id;
    const department = await getDepartmentById(departmentId);
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department' },
      { status: 500 }
    );
  }
}

// Update a specific department (admin only)
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
    
    // Check if user is admin
    if (authResult.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const departmentId = params.id;
    const department = await getDepartmentById(departmentId);
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    const updates = await req.json();
    
    // Ensure required fields
    if (updates.name === '' || updates.code === '') {
      return NextResponse.json(
        { error: 'Name and code cannot be empty' },
        { status: 400 }
      );
    }
    
    const updatedDepartment = await updateDepartment(departmentId, updates);
    
    return NextResponse.json(updatedDepartment);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

// Delete a specific department (admin only)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
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
    
    const departmentId = params.id;
    const department = await getDepartmentById(departmentId);
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    const deleted = await deleteDepartment(departmentId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete department' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}