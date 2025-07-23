"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Shield,
  Clock,
} from "lucide-react";

interface EmailVerificationProps {
  email: string;
  onBack?: () => void;
  isFromLogin?: boolean;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ 
  email, 
  onBack, 
  isFromLogin = false 
}) => {
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();

  // Timer for resend functionality
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Auto-focus first input on mount
  useEffect(() => {
    const firstInput = document.getElementById("code-0");
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== "") && value) {
      handleVerifyCode(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleVerifyCode = async (code?: string) => {
    const codeToVerify = code || verificationCode.join("");
    
    if (codeToVerify.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: codeToVerify,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      setSuccess(true);
      
      // Redirect based on context
      setTimeout(() => {
        if (isFromLogin) {
          router.push("/dashboard");
        } else {
          router.push("/auth/signin?verified=true");
        }
      }, 1500);

    } catch (error) {
      console.error("Verification error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to resend code");
        return;
      }

      // Reset timer
      setTimeLeft(60);
      setCanResend(false);
      
      // Show success feedback
      setError("");
      
    } catch (error) {
      console.error("Resend error:", error);
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-4">
            Your email has been successfully verified.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Redirecting you...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-semibold text-gray-900">{email}</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Verification Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Enter verification code
          </label>
          <div className="flex space-x-3 justify-center">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className={`w-12 h-12 text-center text-xl font-bold border border-gray-200 rounded-xl bg-gray-50 transition-all duration-200 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:bg-white ${
                  error ? 'border-red-300 bg-red-50' : ''
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={() => handleVerifyCode()}
          disabled={isLoading || verificationCode.some(digit => digit === "")}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              <span>Verify Email</span>
            </>
          )}
        </button>

        {/* Resend Section */}
        <div className="text-center space-y-4">
          <div className="text-sm text-gray-600">
            Didn't receive the code?
          </div>
          
          {!canResend ? (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Resend available in {formatTime(timeLeft)}</span>
            </div>
          ) : (
            <button
              onClick={handleResendCode}
              disabled={isResending}
              className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 font-semibold transition-colors disabled:opacity-50"
            >
              {isResending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>{isResending ? "Sending..." : "Resend Code"}</span>
            </button>
          )}
        </div>

        {/* Back Button */}
        {onBack && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;