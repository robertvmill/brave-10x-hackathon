import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Starting job creation process...')
    
    // Get the authenticated user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id)

    // Get user profile to verify they're a recruiter and get company info
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      include: { company: true }
    })

    if (!userProfile) {
      console.error('❌ User profile not found')
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    if (userProfile.userType !== 'recruiter') {
      console.error('❌ User is not a recruiter:', userProfile.userType)
      return NextResponse.json({ error: 'Only recruiters can post jobs' }, { status: 403 })
    }

    if (!userProfile.companyId || !userProfile.company) {
      console.error('❌ Recruiter does not have a company associated')
      return NextResponse.json({ error: 'Recruiter must be associated with a company' }, { status: 400 })
    }

    console.log('✅ Recruiter validated:', userProfile.id, 'Company:', userProfile.company.name)

    // Parse the request body
    const body = await request.json()
    console.log('📝 Job data received:', body)

    const {
      title,
      description,
      requirements,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      location,
      remoteAllowed,
      skillsRequired,
      skillsPreferred
    } = body

    // Validate required fields
    if (!title || !description || !jobType) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, description, and jobType are required' 
      }, { status: 400 })
    }

    // Validate jobType enum
    const validJobTypes = ['Full_time', 'Part_time', 'Contractor', 'Freelance', 'Internship']
    if (!validJobTypes.includes(jobType)) {
      return NextResponse.json({ 
        error: `Invalid job type. Must be one of: ${validJobTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Validate experienceLevel enum (if provided)
    if (experienceLevel) {
      const validExperienceLevels = ['Entry', 'Mid', 'Senior', 'Executive']
      if (!validExperienceLevels.includes(experienceLevel)) {
        return NextResponse.json({ 
          error: `Invalid experience level. Must be one of: ${validExperienceLevels.join(', ')}` 
        }, { status: 400 })
      }
    }

    console.log('✅ Validation passed, creating job posting...')

    // Create the job posting
    const newJob = await prisma.jobOpportunity.create({
      data: {
        title,
        description,
        requirements: requirements || null,
        jobType,
        experienceLevel: experienceLevel || null,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        location: location || null,
        remoteAllowed: remoteAllowed || false,
        skillsRequired: skillsRequired || [],
        skillsPreferred: skillsPreferred || [],
        companyId: userProfile.companyId,
        recruiterId: userProfile.id,
        isActive: true,
        featured: false
      },
      include: {
        company: true,
        recruiter: true
      }
    })

    console.log('✅ Job created successfully:', newJob.id)

    // Return the created job
    return NextResponse.json({
      success: true,
      job: {
        id: newJob.id,
        title: newJob.title,
        company: newJob.company.name,
        location: newJob.location,
        jobType: newJob.jobType,
        salaryMin: newJob.salaryMin,
        salaryMax: newJob.salaryMax,
        isActive: newJob.isActive,
        createdAt: newJob.createdAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error creating job posting:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({ 
          error: 'Invalid company or recruiter reference' 
        }, { status: 400 })
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
    console.log('📋 Fetching job opportunities...')
    
    // Get the authenticated user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: user.id }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    let jobs

    if (userProfile.userType === 'recruiter') {
      // For recruiters, show only their jobs
      jobs = await prisma.jobOpportunity.findMany({
        where: {
          recruiterId: userProfile.id
        },
        include: {
          company: true,
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // For candidates, show all active jobs
      jobs = await prisma.jobOpportunity.findMany({
        where: {
          isActive: true
        },
        include: {
          company: true,
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    // Transform the data for the frontend
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company.name,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      postedTime: getRelativeTime(job.createdAt),
      isActive: job.isActive,
      applications: job._count.applications,
      views: Math.floor(Math.random() * 200) + 50 // Mock view count for now
    }))

    console.log(`✅ Found ${formattedJobs.length} jobs`)

    return NextResponse.json({
      success: true,
      jobs: formattedJobs
    })

  } catch (error) {
    console.error('❌ Error fetching jobs:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days === 1 ? '' : 's'} ago`
  } else {
    const weeks = Math.floor(diffInSeconds / 604800)
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  }
} 