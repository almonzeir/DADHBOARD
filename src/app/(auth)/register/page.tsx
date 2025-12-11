// src/app/(auth)/register/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Eye,
  EyeOff,
  Loader2,
  Building2,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { APP_NAME } from '@/lib/constants';

const ORGANIZATION_TYPES = [
  { value: 'government', label: 'Government Agency' },
  { value: 'tourism_board', label: 'Tourism Board' },
  { value: 'travel_agency', label: 'Travel Agency' },
  { value: 'hotel_association', label: 'Hotel Association' },
  { value: 'tour_operator', label: 'Tour Operator' },
  { value: 'ngo', label: 'NGO / Non-Profit' },
  { value: 'educational', label: 'Educational Institution' },
  { value: 'other', label: 'Other' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  
  // Form state
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Step 1: Account Details
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Step 2: Organization Details
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('');
  const [requestReason, setRequestReason] = useState('');
  
  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    if (!organizationType) {
      newErrors.organizationType = 'Please select organization type';
    }

    if (!requestReason.trim()) {
      newErrors.requestReason = 'Please provide a reason for your request';
    } else if (requestReason.trim().length < 20) {
      newErrors.requestReason = 'Please provide more details (at least 20 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setIsSubmitting(true);

    try {
      await register(
        email.trim(),
        password,
        fullName.trim(),
        organizationName.trim(),
        organizationType,
        requestReason.trim()
      );
      
      setIsSuccess(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-primary/10 via-background to-primary/5">
        <div className="w-full max-w-md text-center">
          <div className="bg-card rounded-xl shadow-lg border p-8">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Request Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Your access request has been submitted successfully. 
              You will be notified once the Super Admin reviews and approves your request.
            </p>

            <div className="bg-muted rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium mb-2">What happens next?</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Your request will be reviewed by the Super Admin</li>
                <li>• You&apos;ll receive approval within 1-3 business days</li>
                <li>• Once approved, you can login with your credentials</li>
              </ul>
            </div>

            <Button onClick={() => router.push('/login')} className="w-full">
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Same as Login */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{APP_NAME}</h1>
              <p className="text-white/80 text-sm">Tourism Intelligence</p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Join the future of tourism analytics
          </h2>
          
          <p className="text-lg text-white/80 mb-10 max-w-md">
            Register your organization to access powerful insights and manage 
            tourism data for Kedah&apos;s ecosystem.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-2 h-2 bg-white rounded-full" />
              <span className="text-white/90">Access real-time tourism data</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-2 h-2 bg-white rounded-full" />
              <span className="text-white/90">Manage your team members</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-2 h-2 bg-white rounded-full" />
              <span className="text-white/90">Generate comprehensive reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-10 h-10 gradient-bg rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">{APP_NAME}</span>
          </div>

          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            onClick={() => step === 1 ? router.push('/login') : setStep(1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 1 ? 'Back to Login' : 'Back'}
          </Button>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Request Access</h2>
            <p className="text-muted-foreground mt-2">
              {step === 1 
                ? 'Create your account credentials'
                : 'Tell us about your organization'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'gradient-bg' : 'bg-muted'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'gradient-bg' : 'bg-muted'}`} />
          </div>

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
            {/* Step 1: Account Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@organization.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    disabled={isSubmitting}
                    className="h-12"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      disabled={isSubmitting}
                      className="h-12 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                    }}
                    disabled={isSubmitting}
                    className="h-12"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-12 mt-6 gradient-bg">
                  Continue
                </Button>
              </div>
            )}

            {/* Step 2: Organization Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                    disabled={isSubmitting}
                    className="h-12"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input
                    id="organizationName"
                    placeholder="e.g., Kedah Tourism Board"
                    value={organizationName}
                    onChange={(e) => {
                      setOrganizationName(e.target.value);
                      if (errors.organizationName) setErrors({ ...errors, organizationName: '' });
                    }}
                    disabled={isSubmitting}
                    className="h-12"
                  />
                  {errors.organizationName && (
                    <p className="text-sm text-destructive">{errors.organizationName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationType">Organization Type *</Label>
                  <Select
                    value={organizationType}
                    onValueChange={(value) => {
                      setOrganizationType(value);
                      if (errors.organizationType) setErrors({ ...errors, organizationType: '' });
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANIZATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.organizationType && (
                    <p className="text-sm text-destructive">{errors.organizationType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestReason">Reason for Request *</Label>
                  <Textarea
                    id="requestReason"
                    placeholder="Please describe why you need access to the admin dashboard..."
                    value={requestReason}
                    onChange={(e) => {
                      setRequestReason(e.target.value);
                      if (errors.requestReason) setErrors({ ...errors, requestReason: '' });
                    }}
                    disabled={isSubmitting}
                    rows={4}
                  />
                  {errors.requestReason && (
                    <p className="text-sm text-destructive">{errors.requestReason}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {requestReason.length}/20 characters minimum
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 mt-6 gradient-bg"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>
            )}
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}