'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface PhoneNumberInputProps {
  onSuccess: () => void;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithPhoneNumber, setUpRecaptcha } = useAuth();

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (!isValidPhoneNumber(formattedPhone)) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      setIsLoading(true);
      
      // For development/demo purposes only
      if (process.env.NODE_ENV === 'development' && formattedPhone === '+15555555555') {
        // Skip actual Firebase auth for test number in development
        console.log('Development mode: Simulating successful phone auth for test number');
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        onSuccess();
        return;
      }
      
      // Set up recaptcha
      setUpRecaptcha('recaptcha-container');
      
      // Attempt to sign in with phone number
      await signInWithPhoneNumber(formattedPhone);
      onSuccess();
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      
      // More specific error messages
      if (err.code === 'auth/invalid-phone-number') {
        setError('The phone number format is invalid. Please check and try again.');
      } else if (err.code === 'auth/captcha-check-failed') {
        setError('Captcha verification failed. Please try again.');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('SMS quota exceeded. Please try again later.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to send verification code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            error={error || undefined}
            disabled={isLoading}
            required
          />
          <div id="recaptcha-container" className="mt-4"></div>
        </div>
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={!phoneNumber}
        >
          Send Verification Code
        </Button>
      </form>
    </div>
  );
};

export default PhoneNumberInput;