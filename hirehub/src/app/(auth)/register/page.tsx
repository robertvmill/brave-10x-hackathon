'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { RegisterFormData, UserType } from '@/types/auth'
import { signUp, signInWithGoogle, signInWithLinkedIn } from '@/lib/auth'
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Eye, EyeOff, ArrowLeft, Users, Briefcase, 
  Mail, Lock, User, Phone, Building, Calendar
} from 'lucide-react'
import { 
  RiGoogleFill, 
  RiLinkedinFill, 
  RiGithubFill 
} from "@remixicon/react"

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  userType: z.enum(['candidate', 'recruiter']),
  company: z.string().optional(),
  title: z.string().optional(),
  phoneNumber: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.userType === 'recruiter' && (!data.company || data.company.trim() === '')) {
    return false
  }
  return true
}, {
  message: 'Company name is required for recruiters',
  path: ['company'],
})

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

// Wrapper component that uses useSearchParams
function RegisterFormWrapper() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<UserType>('candidate')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState(1)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') as UserType | null

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: typeParam || 'candidate',
      agreeToTerms: false,
    },
  })

  const watchedUserType = watch('userType')
  const watchedValues = watch()

  useEffect(() => {
    if (typeParam && (typeParam === 'candidate' || typeParam === 'recruiter')) {
      setValue('userType', typeParam)
      setSelectedUserType(typeParam)
    }
  }, [typeParam, setValue])

  useEffect(() => {
    setSelectedUserType(watchedUserType)
  }, [watchedUserType])

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError('')
    setSuccess('')
    try {
      await signUp(data)
      setSuccess('Account created successfully! Please check your email to verify your account.')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle()
    } catch (error: any) {
      console.error('Google signup error:', error)
      setError(error.message || 'An error occurred during Google signup')
    }
  }

  const handleLinkedInSignup = async () => {
    try {
      await signInWithLinkedIn()
    } catch (error: any) {
      console.error('LinkedIn signup error:', error)
      setError(error.message || 'An error occurred during LinkedIn signup')
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = []
    
    if (step === 1) {
      fieldsToValidate = ['userType', 'fullName', 'email']
    } else if (step === 2) {
      fieldsToValidate = ['password', 'confirmPassword']
      if (selectedUserType === 'recruiter') {
        fieldsToValidate.push('company')
      }
    }
    
    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep(step + 1)
    }
  }

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const getStepTitle = () => {
    switch(step) {
      case 1: return "Account Type & Basic Info"
      case 2: return "Security & Professional Details"
      case 3: return "Final Details & Terms"
      default: return "Create Account"
    }
  }

  const getStepDescription = () => {
    switch(step) {
      case 1: return "Choose your role and provide basic information"
      case 2: return "Set up your password and professional details"
      case 3: return "Complete your registration and agree to terms"
      default: return "Create your account to get started"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to HireHub
          </Link>
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Join HireHub
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Create your account and start connecting
            </p>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
          {/* Step Indicator */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-all duration-300",
                    step >= i 
                      ? "bg-indigo-600 text-white shadow-lg" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  )}
                >
                  {i}
                </div>
                <div className={cn(
                  "text-xs text-center max-w-[60px]",
                  step >= i ? "text-gray-900 dark:text-white font-medium" : "text-gray-500 dark:text-gray-400"
                )}>
                  {i === 1 ? "Account" : i === 2 ? "Security" : "Complete"}
                </div>
              </div>
            ))}
          </div>

          {/* Step Title */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getStepTitle()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {getStepDescription()}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Step 1: User Type & Basic Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* User Type Selection */}
                  <LabelInputContainer>
                    <Label htmlFor="userType">I am a</Label>
                    <Controller
                      name="userType"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="candidate">
                              <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4" />
                                Job Seeker / Candidate
                              </div>
                            </SelectItem>
                            <SelectItem value="recruiter">
                              <div className="flex items-center">
                                <Briefcase className="mr-2 h-4 w-4" />
                                Recruiter / Hiring Manager
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.userType && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.userType.message}</p>
                    )}
                  </LabelInputContainer>

                  {/* Full Name */}
                  <LabelInputContainer>
                    <Label htmlFor="fullName">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        autoComplete="name"
                        placeholder="Enter your full name"
                        className="pl-10"
                        {...register('fullName')}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.fullName.message}</p>
                    )}
                  </LabelInputContainer>

                  {/* Email */}
                  <LabelInputContainer>
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        {...register('email')}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                    )}
                  </LabelInputContainer>
                </motion.div>
              )}

              {/* Step 2: Security & Professional Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Password */}
                  <LabelInputContainer>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Create a strong password"
                        className="pl-10 pr-10"
                        {...register('password')}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                    )}
                  </LabelInputContainer>

                  {/* Confirm Password */}
                  <LabelInputContainer>
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Confirm your password"
                        className="pl-10 pr-10"
                        {...register('confirmPassword')}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
                    )}
                  </LabelInputContainer>

                  {/* Company (Required for recruiters) */}
                  {selectedUserType === 'recruiter' && (
                    <LabelInputContainer>
                      <Label htmlFor="company">Company *</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="company"
                          type="text"
                          placeholder="Enter your company name"
                          className="pl-10"
                          {...register('company')}
                        />
                      </div>
                      {errors.company && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.company.message}</p>
                      )}
                    </LabelInputContainer>
                  )}

                  {/* Job Title */}
                  <LabelInputContainer>
                    <Label htmlFor="title">
                      {selectedUserType === 'recruiter' ? 'Job Title' : 'Current/Desired Position'}
                    </Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="title"
                        type="text"
                        placeholder={selectedUserType === 'recruiter' ? 'e.g., Talent Acquisition Manager' : 'e.g., Software Engineer'}
                        className="pl-10"
                        {...register('title')}
                      />
                    </div>
                    {errors.title && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
                    )}
                  </LabelInputContainer>
                </motion.div>
              )}

              {/* Step 3: Final Details & Terms */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Phone Number */}
                  <LabelInputContainer>
                    <Label htmlFor="phoneNumber">Phone number (optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="pl-10"
                        {...register('phoneNumber')}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.phoneNumber.message}</p>
                    )}
                  </LabelInputContainer>

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Controller
                      name="agreeToTerms"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="agreeToTerms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      )}
                    />
                    <div className="text-sm">
                      <Label htmlFor="agreeToTerms" className="font-normal text-gray-700 dark:text-gray-300">
                        I agree to the{' '}
                        <Link href="/terms" className="text-indigo-600 hover:text-indigo-500 font-medium underline">
                          Terms and Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500 font-medium underline">
                          Privacy Policy
                        </Link>
                      </Label>
                      {errors.agreeToTerms && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.agreeToTerms.message}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                {step > 1 ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={goBack}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}
                
                {step < 3 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || !watchedValues.agreeToTerms}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isLoading ? 'Creating account...' : 'Complete Registration'}
                  </Button>
                )}
              </div>
            </AnimatePresence>
          </form>

          {/* Social Registration Options - Only show on step 1 */}
          {step === 1 && (
            <>
              <div className="relative flex items-center justify-center mt-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                >
                  <RiGoogleFill className="w-5 h-5 mr-2" />
                  Google
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLinkedInSignup}
                  disabled={isLoading}
                >
                  <RiLinkedinFill className="w-5 h-5 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </>
          )}

          {/* Sign in link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterFormWrapper />
    </Suspense>
  )
} 