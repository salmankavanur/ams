// src/components/payment/PaymentModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentModalProps {
  amount: number;
  onSuccess: (paymentInfo: {
    transactionId: string;
    amount: number;
    date: string;
    status: 'pending' | 'completed' | 'failed';
  }) => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ amount, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{
    id: string;
    amount: number;
    currency: string;
    key: string;
  } | null>(null);

  useEffect(() => {
    // Load Razorpay script
    const loadRazorpayScript = async () => {
      return new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    // Create order
    const createOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Wait for Razorpay script to load
        await loadRazorpayScript();

        // Create a new order
        const response = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            metadata: {
              purpose: 'Entrance Exam 2025 Application Fee',
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment order');
        }

        const data = await response.json();
        setOrderData(data);
      } catch (error) {
        console.error('Error creating payment order:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    createOrder();
  }, [amount]);

  const handlePayment = () => {
    if (!orderData) {
      setError('Payment initialization failed');
      return;
    }

    try {
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Entrance Exam 2025',
        description: 'Application Fee',
        order_id: orderData.id,
        handler: function (response: any) {
          // Handle successful payment
          onSuccess({
            transactionId: response.razorpay_payment_id,
            amount: amount,
            date: new Date().toISOString(),
            status: 'completed',
          });
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          purpose: 'Entrance Exam 2025 Application Fee',
        },
        theme: {
          color: '#3366ff',
        },
        modal: {
          ondismiss: function () {
            // Handle modal dismiss
            onCancel();
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      setError('Failed to open payment gateway');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCancel}></div>
      
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Payment</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader size="md" />
          </div>
        ) : error ? (
          <div className="py-6">
            <div className="text-red-500 text-center mb-4">{error}</div>
            <div className="flex justify-end space-x-2">
              <Button className='bg-black text-white' variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              <Button className='bg-black text-white' onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="border-t border-b py-4 my-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Application Fee:</span>
                <span className="font-medium">₹{amount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <Button className='bg-black text-white' variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              <Button className='bg-black text-white' onClick={handlePayment}>
                Pay Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;