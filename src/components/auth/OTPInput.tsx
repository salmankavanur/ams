// src/components/auth/OTPInput.tsx
'use client';

import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from 'next/navigation';

interface OTPInputProps {
  length?: number;
  onBack: () => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onBack }) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const [activeInput, setActiveInput] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { confirmOTP, userData } = useAuth();
  const [timer, setTimer] = useState(60);
  const router = useRouter();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError(null);
    if (value && index < length - 1) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        setActiveInput(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      setActiveInput(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    for (let i = 0; i < Math.min(length, pastedData.length); i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    const lastIndex = Math.min(length - 1, pastedData.length - 1);
    setActiveInput(lastIndex);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (otp.some((digit) => digit === "")) {
      setError("Please enter the complete verification code");
      return;
    }
   
    try {
      setIsLoading(true);
      console.log("Verifying OTP:", otp.join(""));

      // Development mode check - allow easy login with 123456
      if (process.env.NODE_ENV === "development" && otp.join("") === "123456") {
        console.log("Development mode: Using test OTP code");
      }

      // Call the confirmOTP function from AuthContext
      const result = await confirmOTP(otp.join(""));
      console.log("OTP confirmation successful:", result);
      
      // Get user role and redirect accordingly
      const role = userData?.role || 'user';
      console.log("Redirecting based on role:", role);
      
      // The router.push will be handled here for development mode
      router.push(role === 'admin' ? '/dashboard/admin' : '/dashboard/user');
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      if (err.code === "auth/invalid-verification-code") {
        setError("The verification code you entered is invalid. Please try again.");
      } else if (err.code === "auth/code-expired") {
        setError("The verification code has expired. Please request a new one.");
      } else {
        setError(err.message || "Invalid verification code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Enter Verification Code</h2>
      <p className="text-gray-600 mb-6">
        We sent a 6-digit code to your phone. Enter it below to verify.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              onFocus={() => setActiveInput(index)}
              autoFocus={index === activeInput}
              className={`
                w-12 h-12 text-center text-xl font-bold 
                border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                ${error ? "border-red-500" : "border-gray-300"}
              `}
              disabled={isLoading}
            />
          ))}
        </div>

        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

        <div className="text-center mb-4">
          {timer > 0 ? (
            <p className="text-gray-600">Resend code in {timer}s</p>
          ) : (
            <button type="button" className="text-primary font-medium" onClick={onBack}>
              Resend verification code
            </button>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={otp.some((digit) => digit === "") || isLoading}
          >
            Verify
          </Button>

          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OTPInput;