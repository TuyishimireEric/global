"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Building2,
} from "lucide-react";

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Reusable Input Component
interface InputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  icon,
  error,
  required = false,
  showPasswordToggle = false,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle && showPassword ? "text" : type;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
            isFocused ? 'text-yellow-500' : 'text-gray-400'
          }`}>
            {icon}
          </div>
        )}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${
            icon ? "pl-12" : "pl-4"
          } ${
            showPasswordToggle ? "pr-12" : "pr-4"
          } py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none bg-gray-50 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200 bg-red-50"
              : isFocused
              ? "border-yellow-500 focus:ring-2 focus:ring-yellow-200 shadow-sm bg-white"
              : "hover:border-gray-300 focus:border-yellow-500 hover:bg-white"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-start space-x-2 text-red-600 text-sm rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Validation functions
const validateEmail = (email: string): string => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

const validatePassword = (password: string): string => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/(?=.*[a-z])/.test(password)) return "Must contain at least one lowercase letter";
  if (!/(?=.*[A-Z])/.test(password)) return "Must contain at least one uppercase letter";
  if (!/(?=.*\d)/.test(password)) return "Must contain at least one number";
  return "";
};

const validateRequired = (value: string, fieldName: string): string => {
  if (!value.trim()) return `${fieldName} is required`;
  return "";
};

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Errors
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});

  // Handle input changes
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (loginErrors[name]) {
      setLoginErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    if (registerErrors[name]) {
      setRegisterErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validation on blur
  const handleLoginBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let error = "";

    switch (name) {
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = value ? "" : "Password is required";
        break;
    }

    setLoginErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleRegisterBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let error = "";

    switch (name) {
      case "firstName":
        error = validateRequired(value, "First name");
        break;
      case "lastName":
        error = validateRequired(value, "Last name");
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "confirmPassword":
        error = value !== registerData.password ? "Passwords do not match" : "";
        break;
    }

    setRegisterErrors(prev => ({ ...prev, [name]: error }));
  };

  // Form validation
  const validateLoginForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    errors.email = validateEmail(loginData.email);
    errors.password = loginData.password ? "" : "Password is required";

    setLoginErrors(errors);
    return !Object.values(errors).some(error => error !== "");
  };

  const validateRegisterForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    errors.firstName = validateRequired(registerData.firstName, "First name");
    errors.lastName = validateRequired(registerData.lastName, "Last name");
    errors.email = validateEmail(registerData.email);
    errors.password = validatePassword(registerData.password);
    errors.confirmPassword = registerData.confirmPassword !== registerData.password ? "Passwords do not match" : "";

    setRegisterErrors(errors);
    return !Object.values(errors).some(error => error !== "");
  };

  // Form submissions
  const handleLoginSubmit = async () => {
    if (!validateLoginForm()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const handleRegisterSubmit = async () => {
    if (!validateRegisterForm()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - matching the parts page style */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">
                <span className="text-black">CAT</span> Parts Portal
              </h1>
              <p className="text-yellow-100">Professional parts management</p>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-yellow-100">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Secure Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-medium">Professional Portal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success notification */}
      <div className={`fixed top-6 right-6 bg-white border border-green-200 text-gray-800 px-6 py-4 rounded-xl shadow-xl flex items-center space-x-3 z-50 transition-all duration-500 transform ${showSuccess ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'}`}>
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <div className="font-semibold text-sm text-gray-900">Welcome!</div>
          <div className="text-xs text-gray-600">
            {isLogin ? "Successfully signed in" : "Account created successfully"}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Right Panel - Auth Form */}
          <div className="lg:w-full w-full max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-6">
              
              {/* Enhanced Tab Switcher */}
              <div className="relative bg-gray-100 rounded-2xl p-1.5 mb-8">
                {/* Animated Background Slider */}
                <div 
                  className={`absolute top-1.5 left-1.5 w-[calc(50%-3px)] h-[calc(100%-12px)] bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg transition-transform duration-300 ease-out ${
                    isLogin ? 'transform translate-x-0' : 'transform translate-x-full'
                  }`}
                />
                
                {/* Tab Buttons */}
                <div className="relative flex">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`cursor-pointer flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 relative z-10 ${
                      isLogin
                        ? "text-white"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Sign In</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`cursor-pointer flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 relative z-10 ${
                      !isLogin
                        ? "text-white"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Register</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="relative">
                {isLogin ? (
                  <div className={`space-y-3 transition-all duration-300 ${isLogin ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h3>
                      <p className="text-gray-600">Sign in to access your professional dashboard</p>
                    </div>

                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      onBlur={handleLoginBlur}
                      placeholder="your@company.com"
                      icon={<Mail className="h-5 w-5" />}
                      error={loginErrors.email}
                      required
                      disabled={isLoading}
                    />

                    <Input
                      label="Password"
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      onBlur={handleLoginBlur}
                      placeholder="Enter your password"
                      icon={<Lock className="h-5 w-5" />}
                      error={loginErrors.password}
                      required
                      showPasswordToggle
                      disabled={isLoading}
                    />

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-600">Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleLoginSubmit}
                        disabled={isLoading}
                        className="cursor-pointer w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Signing in...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500">or continue with</span>
                        </div>
                      </div>

                      <button
                        onClick={handleGoogleAuth}
                        disabled={isGoogleLoading}
                        className="w-full cursor-pointer bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                      >
                        {isGoogleLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <GoogleIcon />
                        )}
                        <span>Continue with Google</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`space-y-6 transition-all duration-300 ${!isLogin ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h3>
                      <p className="text-gray-600">Join thousands of professionals worldwide</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        type="text"
                        name="firstName"
                        value={registerData.firstName}
                        onChange={handleRegisterChange}
                        onBlur={handleRegisterBlur}
                        placeholder="John"
                        icon={<User className="h-5 w-5" />}
                        error={registerErrors.firstName}
                        required
                        disabled={isLoading}
                      />

                      <Input
                        label="Last Name"
                        type="text"
                        name="lastName"
                        value={registerData.lastName}
                        onChange={handleRegisterChange}
                        onBlur={handleRegisterBlur}
                        placeholder="Doe"
                        icon={<User className="h-5 w-5" />}
                        error={registerErrors.lastName}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      onBlur={handleRegisterBlur}
                      placeholder="john@company.com"
                      icon={<Mail className="h-5 w-5" />}
                      error={registerErrors.email}
                      required
                      disabled={isLoading}
                    />

                    <Input
                      label="Password"
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      onBlur={handleRegisterBlur}
                      placeholder="Create a strong password"
                      icon={<Lock className="h-5 w-5" />}
                      error={registerErrors.password}
                      required
                      showPasswordToggle
                      disabled={isLoading}
                    />

                    <Input
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      onBlur={handleRegisterBlur}
                      placeholder="Confirm your password"
                      icon={<Lock className="h-5 w-5" />}
                      error={registerErrors.confirmPassword}
                      required
                      showPasswordToggle
                      disabled={isLoading}
                    />

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 focus:ring-2 mt-1"
                      />
                      <span className="text-sm text-gray-600 leading-relaxed">
                        I agree to the{" "}
                        <button type="button" className="text-yellow-600 hover:text-yellow-700 font-semibold underline">
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button type="button" className="text-yellow-600 hover:text-yellow-700 font-semibold underline">
                          Privacy Policy
                        </button>
                      </span>
                    </label>

                    <div className="space-y-4">
                      <button
                        onClick={handleRegisterSubmit}
                        disabled={isLoading}
                        className="cursor-pointer w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Creating account...</span>
                          </>
                        ) : (
                          <>
                            <span>Create Account</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500">or continue with</span>
                        </div>
                      </div>

                      <button
                        onClick={handleGoogleAuth}
                        disabled={isGoogleLoading}
                        className="cursor-pointer w-full bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                      >
                        {isGoogleLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <GoogleIcon />
                        )}
                        <span>Continue with Google</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;