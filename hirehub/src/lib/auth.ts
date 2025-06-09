import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AuthUser, LoginFormData, RegisterFormData } from '@/types/auth'

export const supabase = createClientComponentClient()

export const signUp = async (data: RegisterFormData) => {
  const { error, data: authData } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        user_type: data.userType,
        company: data.company,
        title: data.title,
        phone_number: data.phoneNumber,
      },
    },
  })

  if (error) {
    throw error
  }

  return authData
}

export const signIn = async (data: LoginFormData) => {
  const { error, data: authData } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    throw error
  }

  return authData
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  return {
    id: user.id,
    email: user.email!,
    fullName: user.user_metadata?.full_name || '',
    userType: user.user_metadata?.user_type || 'candidate',
    company: user.user_metadata?.company,
    title: user.user_metadata?.title,
    phoneNumber: user.user_metadata?.phone_number,
    createdAt: user.created_at,
    emailVerified: !!user.email_confirmed_at,
  }
}

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }
}

export const signInWithLinkedIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }
} 