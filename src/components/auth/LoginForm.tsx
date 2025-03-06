'use client';

import React, { useState } from 'react';
import PhoneNumberInput from './PhoneNumberInput';
import OTPInput from './OTPInput';

enum AuthStep {
  PHONE_NUMBER,
  OTP_VERIFICATION
}

const LoginForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>(AuthStep.PHONE_NUMBER);
  
  const handlePhoneVerificationSuccess = () => {
    setCurrentStep(AuthStep.OTP_VERIFICATION);
  };
  
  const handleBackToPhone = () => {
    setCurrentStep(AuthStep.PHONE_NUMBER);
  };
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
        <p className="text-gray-600">
          {currentStep === AuthStep.PHONE_NUMBER
            ? 'Sign in with your phone number'
            : 'Verify your phone number'}
        </p>
      </div>
      
      {currentStep === AuthStep.PHONE_NUMBER ? (
        <PhoneNumberInput onSuccess={handlePhoneVerificationSuccess} />
      ) : (
        <OTPInput onBack={handleBackToPhone} />
      )}
    </div>
  );
};

export default LoginForm;