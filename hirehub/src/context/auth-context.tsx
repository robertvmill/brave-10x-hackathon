'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AuthUser } from '@/types/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  const setupUserProfile = async (authUser: any) => {
    try {
      console.log('🔧 Setting up user profile...')
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Profile setup completed:', data)
      } else {
        console.warn('⚠️ Profile setup failed, but user can continue')
      }
    } catch (error) {
      console.error('❌ Profile setup error:', error)
      // Don't block user flow if profile setup fails
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          fullName: session.user.user_metadata?.full_name || '',
          userType: session.user.user_metadata?.user_type || 'candidate',
          company: session.user.user_metadata?.company,
          title: session.user.user_metadata?.title,
          phoneNumber: session.user.user_metadata?.phone_number,
          createdAt: session.user.created_at,
          emailVerified: !!session.user.email_confirmed_at,
        }
        setUser(authUser)
        
        // Ensure profile is set up in database
        await setupUserProfile(session.user)
      }
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            fullName: session.user.user_metadata?.full_name || '',
            userType: session.user.user_metadata?.user_type || 'candidate',
            company: session.user.user_metadata?.company,
            title: session.user.user_metadata?.title,
            phoneNumber: session.user.user_metadata?.phone_number,
            createdAt: session.user.created_at,
            emailVerified: !!session.user.email_confirmed_at,
          }
          setUser(authUser)
          
          // Ensure profile is set up in database
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await setupUserProfile(session.user)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 