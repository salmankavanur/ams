// src/app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-helpers';
import crypto from 'crypto';

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
    
    // Verify the payment signature
    const signature = data.razorpay_signature;
    const orderId = data.razorpay_order_id;
    const paymentId = data.razorpay_payment_id;
    
    // Validate required fields
    if (!signature || !orderId || !paymentId) {
      return NextResponse.json(
        { error: 'Missing payment information' },
        { status: 400 }
      );
    }
    
    // Generate a signature for verification
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');
    
    // Compare signatures
    const isAuthentic = expectedSignature === signature;
    
    if (!isAuthentic) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      orderId,
      paymentId,
      userId: authResult.uid,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}