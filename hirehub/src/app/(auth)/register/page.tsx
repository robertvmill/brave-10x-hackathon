'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Mail, Lock, User, Phone, Building, Calendar, Linkedin
} from 'lucide-react'
import { 
  RiGoogleFill, 
  RiLinkedinFill, 
  RiGithubFill 
} from "@remixicon/react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

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
    console.log('🚀 Registration started with data:', {
      userType: data.userType,
      fullName: data.fullName,
      email: data.email,
      company: data.company,
      title: data.title,
      phoneNumber: data.phoneNumber,
      agreeToTerms: data.agreeToTerms,
      hasPassword: !!data.password,
      passwordsMatch: data.password === data.confirmPassword
    })
    
    setIsLoading(true)
    setError('')
    setSuccess('')
    
    try {
      console.log('📤 Calling signUp function...')
      const result = await signUp(data)
      console.log('✅ signUp completed successfully:', result)
      
      setSuccess('Account created successfully! You can now sign in to your account.')
      console.log('🎉 Success message set, redirecting in 3 seconds...')
      
      setTimeout(() => {
        console.log('🔄 Redirecting to login page...')
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      console.error('❌ Registration error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        status: error.status,
        response: error.response?.data || error.response,
        fullError: error
      })
      
      let errorMessage = 'An error occurred during registration'
      
      // More specific error handling
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.code) {
        errorMessage = `Error code: ${error.code}`
      }
      
      console.log('📝 Setting error message:', errorMessage)
      setError(errorMessage)
    } finally {
      console.log('🏁 Registration process completed, setting loading to false')
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

  const handleLinkedInRegister = async () => {
    try {
      setIsLoading(true)
      const { error } = await createClientComponentClient().auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      })
      
      if (error) throw error
    } catch (error) {
      console.error('LinkedIn registration error:', error)
      setError(error instanceof Error ? error.message : 'LinkedIn registration failed')
    } finally {
      setIsLoading(false)
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
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Geometric Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-muted/10 blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-72 h-72 rounded-full bg-muted/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-muted/5 blur-3xl"></div>
      </div>

      <div className="relative max-w-lg w-full">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to HireHub
          </Link>
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Join HireHub
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your account and start connecting
            </p>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-card/70 backdrop-blur-sm rounded-lg border border-border/50 p-8 shadow-lg">
          {/* Step Indicator */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-all duration-300",
                    step >= i 
                      ? "bg-primary text-primary-foreground shadow-lg" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {i}
                </div>
                <div className={cn(
                  "text-xs text-center max-w-[60px]",
                  step >= i ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {i === 1 ? "Account" : i === 2 ? "Security" : "Complete"}
                </div>
              </div>
            ))}
          </div>

          {/* Step Title */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-foreground">
              {getStepTitle()}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {getStepDescription()}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Debug Panel - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h4>
              <div className="text-xs text-yellow-700 space-y-1">
                <p><strong>Step:</strong> {step}</p>
                <p><strong>User Type:</strong> {selectedUserType}</p>
                <p><strong>Form Valid:</strong> {Object.keys(errors).length === 0 ? 'Yes' : 'No'}</p>
                <p><strong>Errors:</strong> {Object.keys(errors).join(', ') || 'None'}</p>
                <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                <p><strong>Agree to Terms:</strong> {watchedValues.agreeToTerms ? 'Yes' : 'No'}</p>
                {Object.keys(errors).length > 0 && (
                  <div className="mt-2">
                    <strong>Error Details:</strong>
                    <pre className="text-xs">{JSON.stringify(errors, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit((data) => {
            console.log('📋 Form submitted with data:', data)
            console.log('🔍 Form validation state:', { 
              isValid: Object.keys(errors).length === 0,
              errors: errors,
              step: step 
            })
            return onSubmit(data)
          })}>
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
                      <p className="text-sm text-destructive">{errors.userType.message}</p>
                    )}
                  </LabelInputContainer>

                  {/* Full Name */}
                  <LabelInputContainer>
                    <Label htmlFor="fullName">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      <p className="text-sm text-destructive">{errors.fullName.message}</p>
                    )}
                  </LabelInputContainer>

                  {/* Email */}
                  <LabelInputContainer>
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      <p className="text-sm text-destructive">{errors.email.message}</p>
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
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </LabelInputContainer>

                  {/* Confirm Password */}
                  <LabelInputContainer>
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                    )}
                  </LabelInputContainer>

                  {/* Company (Required for recruiters) */}
                  {selectedUserType === 'recruiter' && (
                    <LabelInputContainer>
                      <Label htmlFor="company">Company *</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="company"
                          type="text"
                          placeholder="Enter your company name"
                          className="pl-10"
                          {...register('company')}
                        />
                      </div>
                      {errors.company && (
                        <p className="text-sm text-destructive">{errors.company.message}</p>
                      )}
                    </LabelInputContainer>
                  )}

                  {/* Job Title */}
                  <LabelInputContainer>
                    <Label htmlFor="title">
                      {selectedUserType === 'recruiter' ? 'Job Title' : 'Current/Desired Position'}
                    </Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="title"
                        type="text"
                        placeholder={selectedUserType === 'recruiter' ? 'e.g., Talent Acquisition Manager' : 'e.g., Software Engineer'}
                        className="pl-10"
                        {...register('title')}
                      />
                    </div>
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
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
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="pl-10"
                        {...register('phoneNumber')}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                    )}
                  </LabelInputContainer>

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
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
                      <Label htmlFor="agreeToTerms" className="font-normal text-foreground">
                        I agree to the{' '}
                        <Link href="/terms" className="text-primary hover:text-primary/80 font-medium underline">
                          Terms and Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-primary hover:text-primary/80 font-medium underline">
                          Privacy Policy
                        </Link>
                      </Label>
                      {errors.agreeToTerms && (
                        <p className="mt-1 text-sm text-destructive">{errors.agreeToTerms.message}</p>
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
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || !watchedValues.agreeToTerms}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
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
                  onClick={handleLinkedInRegister}
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
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80"
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