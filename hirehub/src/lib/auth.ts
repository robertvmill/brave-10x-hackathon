import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AuthUser, LoginFormData, RegisterFormData } from '@/types/auth'

const supabase = createClientComponentClient()

export async function signUp(data: RegisterFormData) {
  console.log('🔐 Starting signUp with data:', data)
  
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          user_type: data.userType,
          company: data.company,
          title: data.title,
          phone_number: data.phoneNumber,
        }
      }
    })

    if (error) {
      console.error('❌ Supabase signUp error:', error)
      throw error
    }

    console.log('✅ SignUp successful:', authData)
    return authData
  } catch (error) {
    console.error('❌ SignUp function error:', error)
    throw error
  }
}

export async function signIn(data: LoginFormData) {
  console.log('🔐 Starting signIn with email:', data.email)
  
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      console.error('❌ Supabase signIn error:', error)
      throw error
    }

    console.log('✅ SignIn successful:', authData)
    return authData
  } catch (error) {
    console.error('❌ SignIn function error:', error)
    throw error
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      }
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('❌ Google signIn error:', error)
    throw error
  }
}

export async function signInWithLinkedIn() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      }
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('❌ LinkedIn signIn error:', error)
    throw error
  }
} 