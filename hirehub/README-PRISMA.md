# HireHub Database Setup with Prisma + Supabase

This guide will help you set up the HireHub database using Prisma as the ORM with Supabase as the PostgreSQL provider.

## 🚀 Quick Setup

### 1. Environment Variables

Make sure your `.env` file has the correct Supabase database URL:

```env
# Your Supabase database URL (connection pooling)
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# For migrations and schema changes (direct connection)
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

**Get your database URL:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Copy the "Connection string" and replace `[password]` with your database password

### 2. Push Schema to Database

```bash
# Push the Prisma schema to your Supabase database
npm run db:push

# Generate the Prisma client
npm run db:generate
```

### 3. Seed the Database

```bash
# Populate with sample companies, skills, and job opportunities
npm run db:seed
```

## 📊 Database Schema Overview

### Core Models

- **UserProfile** - Extended user profiles (links to Supabase auth.users)
- **Company** - Company information and details
- **JobOpportunity** - Job postings with skills and requirements
- **Application** - Job applications with status tracking
- **UserJobPreference** - Candidate job preferences for matching
- **SavedJob** - Bookmarked jobs by candidates
- **ProfileView** - Analytics for profile views
- **Skill** - Master list of skills
- **OnboardingProgress** - Track user onboarding completion

### Key Features

- **Type Safety** - Full TypeScript support with Prisma Client
- **Relationships** - Proper foreign key constraints and joins
- **Enums** - Consistent data types (JobType, ExperienceLevel, etc.)
- **Indexing** - Optimized queries for performance
- **Row Level Security** - Inherits Supabase RLS policies

## 🛠 Development Commands

```bash
# View and edit data in Prisma Studio
npm run db:studio

# Reset database and re-seed
npm run db:reset

# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push
```

## 🔧 Usage Examples

### Basic Operations

```typescript
import { prisma, dbOperations } from '@/lib/prisma'

// Get user profile with relationships
const user = await dbOperations.getUserProfile(userId)

// Get job opportunities with company info
const jobs = await dbOperations.getActiveJobOpportunities(20, 0)

// Save user job preferences
await dbOperations.saveJobPreferences(userId, selectedJobIds)

// Create an application
await dbOperations.createApplication({
  candidateId: user.id,
  opportunityId: job.id,
  recruiterId: job.recruiterId,
  coverLetter: "I'm interested in this role..."
})
```

### Advanced Queries

```typescript
// Search jobs with filters
const searchResults = await dbOperations.searchJobOpportunities(
  'AI engineer',
  {
    jobType: ['Full_time'],
    experienceLevel: ['Senior'],
    remoteAllowed: true
  }
)

// Get candidate applications with status
const applications = await dbOperations.getUserApplications(candidateId)

// Analytics - profile views
const viewCount = await dbOperations.getProfileViews(profileId, 30)
```

## 🔐 Security & Permissions

The schema includes Row Level Security (RLS) policies that work with Supabase:

- Users can only access their own profiles
- Recruiters can view candidate profiles
- Applications are visible to candidates and relevant recruiters
- Job opportunities are public when active

## 📝 Schema Changes

When making schema changes:

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Run `npm run db:generate` to update the client
4. Update seed file if needed
5. Test with `npm run db:reset`

## 🚨 Important Notes

- **User Profiles**: The `UserProfile` model extends Supabase's `auth.users` table
- **UUID References**: All IDs use UUID format to match Supabase
- **Connection Pooling**: Uses pgBouncer for production optimization
- **Migrations**: Use `db:push` for development, consider migrations for production

## 📋 Sample Data

The seed script creates:
- 6 sample companies across different industries
- 15 common skills categorized by type
- 6 realistic job opportunities
- Sample recruiter profile

Perfect for testing the candidate onboarding flow and job matching features!

## 🐛 Troubleshooting

**Connection Issues:**
- Verify DATABASE_URL is correct
- Check Supabase project is running
- Ensure IP is allowlisted in Supabase

**Schema Conflicts:**
- Drop conflicting tables manually in Supabase SQL editor
- Run `npm run db:reset` to start fresh

**Type Errors:**
- Run `npm run db:generate` after schema changes
- Restart TypeScript server in your IDE 