'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not authenticated, redirect to login
        router.push('/login')
        return
      }

      // Redirect based on user type
      if (user.userType === 'candidate') {
        router.push('/dashboard/candidate')
      } else if (user.userType === 'recruiter') {
        router.push('/dashboard/recruiter')
      } else {
        // Fallback to candidate if user type is unclear
        router.push('/dashboard/candidate')
      }
    }
  }, [user, loading, router])

  // Show loading spinner while determining redirect
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  )
} 