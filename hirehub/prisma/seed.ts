import { PrismaClient } from '../src/generated/prisma'

// Use the direct URL for seeding to avoid transaction pooler issues
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
})

async function main() {
  // Check if data already exists
  const existingJobs = await prisma.jobOpportunity.count()
  if (existingJobs > 0) {
    console.log('Jobs already exist in database, skipping seed...')
    return
  }

  console.log('Starting database seed...')

  // Create companies
  let openai, techStartups, consultingFirms

  try {
    openai = await prisma.company.create({
      data: {
        name: 'OpenAI',
        description: 'Leading AI research and deployment company',
        website: 'https://openai.com',
        industry: 'Technology',
        sizeRange: '200-500',
        location: 'San Francisco, CA'
      }
    })
    console.log('Created OpenAI company')
  } catch (error) {
    console.log('OpenAI company might already exist, finding it...')
    openai = await prisma.company.findFirst({ where: { name: 'OpenAI' } })
  }

  if (!openai) {
    console.log('Could not create or find OpenAI company, exiting...')
    return
  }

  try {
    techStartups = await prisma.company.create({
      data: {
        name: 'Tech Startups',
        description: 'Various growing technology startups',
        industry: 'Technology',
        sizeRange: '10-50',
        location: 'San Francisco, CA'
      }
    })
    console.log('Created Tech Startups company')
  } catch (error) {
    console.log('Tech Startups company might already exist')
    techStartups = await prisma.company.findFirst({ where: { name: 'Tech Startups' } })
  }

  try {
    consultingFirms = await prisma.company.create({
      data: {
        name: 'Consulting Firms',
        description: 'Top-tier management consulting firms',
        industry: 'Consulting',
        sizeRange: '1000+',
        location: 'New York, NY'
      }
    })
    console.log('Created Consulting Firms company')
  } catch (error) {
    console.log('Consulting Firms company might already exist')
    consultingFirms = await prisma.company.findFirst({ where: { name: 'Consulting Firms' } })
  }

  // Create a sample recruiter profile
  const recruiterId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  
  try {
    await prisma.userProfile.create({
      data: {
        id: recruiterId,
        fullName: 'Sarah Johnson',
        userType: 'recruiter',
        companyId: openai.id,
        title: 'Senior Technical Recruiter',
        bio: 'Experienced recruiter specializing in AI and ML talent',
        profileCompleted: true
      }
    })
    console.log('Created recruiter profile')
  } catch (error) {
    console.log('Recruiter profile might already exist')
  }

  // Create job opportunities
  const jobs = [
    {
      title: 'Software Engineer, Full Stack',
      companyId: openai.id,
      recruiterId: recruiterId,
      description: 'Build the future of AI with cutting-edge web applications',
      requirements: 'Strong experience with React, Node.js, and Python',
      jobType: 'Full_time' as const,
      experienceLevel: 'Senior' as const,
      salaryMin: 255000,
      salaryMax: 405000,
      location: 'San Francisco, CA',
      remoteAllowed: true,
      skillsRequired: ['JavaScript', 'React', 'Node.js', 'Python'],
      skillsPreferred: ['TypeScript', 'AWS', 'Docker'],
      featured: true
    },
    {
      title: 'Software Engineer, Backend',
      companyId: openai.id,
      recruiterId: recruiterId,
      description: 'Design and build scalable backend systems for AI applications',
      requirements: 'Experience with distributed systems and microservices',
      jobType: 'Full_time' as const,
      experienceLevel: 'Senior' as const,
      salaryMin: 255000,
      salaryMax: 405000,
      location: 'San Francisco, CA',
      remoteAllowed: true,
      skillsRequired: ['Python', 'Go', 'Kubernetes', 'PostgreSQL'],
      skillsPreferred: ['Redis', 'GraphQL', 'gRPC'],
      featured: true
    },
    {
      title: 'Software Engineer, Infrastructure',
      companyId: openai.id,
      recruiterId: recruiterId,
      description: 'Build and maintain the infrastructure that powers AI at scale',
      requirements: 'Strong DevOps and cloud infrastructure experience',
      jobType: 'Full_time' as const,
      experienceLevel: 'Mid' as const,
      salaryMin: 210000,
      salaryMax: 405000,
      location: 'San Francisco, CA',
      remoteAllowed: false,
      skillsRequired: ['AWS', 'Kubernetes', 'Terraform', 'Python'],
      skillsPreferred: ['Prometheus', 'Grafana', 'Helm'],
      featured: true
    }
  ]

  for (const job of jobs) {
    try {
      await prisma.jobOpportunity.create({
        data: job
      })
      console.log(`Created job: ${job.title}`)
    } catch (error) {
      console.log(`Error creating job ${job.title}:`, error)
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 