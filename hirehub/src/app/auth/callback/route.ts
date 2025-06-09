import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    return NextResponse.redirect(new URL(`/signin?error=${encodeURIComponent(error)}`, requestUrl.origin))
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(new URL('/signin?error=auth_error', requestUrl.origin))
      }

      if (data.user) {
        // Check if user profile exists, if not create one
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (!profile && !profileError) {
          // Create user profile
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
              user_type: 'candidate', // Default to candidate
              profile_completed: false
            })

          if (insertError) {
            console.error('Error creating user profile:', insertError)
          }
        }

        // Redirect to dashboard or onboarding based on profile completion
        const redirectUrl = profile?.profile_completed 
          ? '/dashboard/candidate' 
          : '/dashboard/candidate' // You can change this to onboarding if needed

        return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
      }
    } catch (error) {
      console.error('Unexpected auth error:', error)
      return NextResponse.redirect(new URL('/signin?error=unexpected_error', requestUrl.origin))
    }
  }

  // If no code, redirect to signin
  return NextResponse.redirect(new URL('/signin', requestUrl.origin))
} 