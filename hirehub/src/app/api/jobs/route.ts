import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Starting jobs API request...')
    
    // Test basic connection first
    console.log('Testing Prisma connection...')
    await prisma.$connect()
    console.log('Prisma connected successfully')
    
    // Test simple query first
    console.log('Testing job count...')
    const jobCount = await prisma.jobOpportunity.count()
    console.log('Job count:', jobCount)
    
    const jobs = await prisma.jobOpportunity.findMany({
      where: {
        isActive: true
      },
      include: {
        company: true,
        recruiter: {
          select: {
            fullName: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('Found jobs:', jobs.length)

    // Transform the data to match the frontend format
    const transformedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company.name,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      postedTime: getTimeAgo(job.createdAt),
      isActive: job.isActive,
      featured: job.featured,
      description: job.description,
      requirements: job.requirements,
      skillsRequired: job.skillsRequired,
      skillsPreferred: job.skillsPreferred,
      remoteAllowed: job.remoteAllowed,
      companyInfo: {
        name: job.company.name,
        description: job.company.description,
        website: job.company.website,
        logoUrl: job.company.logoUrl,
        industry: job.company.industry,
        location: job.company.location
      },
      recruiter: {
        name: job.recruiter.fullName,
        title: job.recruiter.title
      }
    }))

    console.log('Transformed jobs successfully')
    return NextResponse.json(transformedJobs)
  } catch (error) {
    console.error('Detailed error in jobs API:', error)
    console.error('Error name:', error?.name)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: error?.message },
      { status: 500 }
    )
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
} 