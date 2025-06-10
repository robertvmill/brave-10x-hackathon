import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting profile setup process...')
    
    // Get the authenticated user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id)

    // Check if profile already exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { id: user.id }
    })

    if (existingProfile) {
      console.log('ℹ️ Profile already exists')
      return NextResponse.json({ 
        success: true, 
        message: 'Profile already exists',
        profile: existingProfile 
      })
    }

    // Extract user metadata
    const userData = user.user_metadata || {}
    const fullName = userData.full_name || ''
    const userType = userData.user_type || 'candidate'
    const companyName = userData.company || ''
    const title = userData.title || ''
    const phoneNumber = userData.phone_number || ''

    console.log('📝 User data:', {
      fullName,
      userType,
      companyName,
      title,
      phoneNumber
    })

    let companyId = null

    // If user is a recruiter and has a company name, create/find company
    if (userType === 'recruiter' && companyName) {
      console.log('🏢 Creating/finding company for recruiter...')
      
      // Try to find existing company first
      let company = await prisma.company.findFirst({
        where: {
          name: {
            equals: companyName,
            mode: 'insensitive'
          }
        }
      })

      if (!company) {
        // Create new company
        company = await prisma.company.create({
          data: {
            name: companyName,
            description: `${companyName} - Professional services company`,
            industry: 'Other', // Default industry
            sizeRange: '1-50', // Default size range
            location: null
          }
        })
        console.log('✅ Company created:', company.name, company.id)
      } else {
        console.log('✅ Company found:', company.name, company.id)
      }
      
      companyId = company.id
    }

    // Create user profile
    const userProfile = await prisma.userProfile.create({
      data: {
        id: user.id,
        fullName: fullName || null,
        userType: userType as 'candidate' | 'recruiter',
        companyId: companyId,
        title: title || null,
        phoneNumber: phoneNumber || null,
        profileCompleted: false,
        profileStrength: 25 // Initial profile strength
      },
      include: {
        company: true
      }
    })

    console.log('✅ User profile created:', userProfile.id)

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      profile: {
        id: userProfile.id,
        fullName: userProfile.fullName,
        userType: userProfile.userType,
        company: userProfile.company?.name || null,
        title: userProfile.title,
        profileCompleted: userProfile.profileCompleted
      }
    })

  } catch (error) {
    console.error('❌ Error creating profile:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ 
          error: 'Profile already exists' 
        }, { status: 409 })
      }
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching user profile...')
    
    // Get the authenticated user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      include: { company: true }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: userProfile.id,
        fullName: userProfile.fullName,
        userType: userProfile.userType,
        company: userProfile.company?.name || null,
        title: userProfile.title,
        phoneNumber: userProfile.phoneNumber,
        profileCompleted: userProfile.profileCompleted,
        profileStrength: userProfile.profileStrength
      }
    })

  } catch (error) {
    console.error('❌ Error fetching profile:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 