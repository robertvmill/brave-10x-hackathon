import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId;

    if (!jobId) {
      return NextResponse.json({ 
        error: 'Job ID is required' 
      }, { status: 400 });
    }

    // Get job details with company information
    const { data: job, error } = await supabase
      .from('job_opportunities')
      .select(`
        id,
        title,
        description,
        requirements,
        job_type,
        experience_level,
        salary_min,
        salary_max,
        location,
        remote_allowed,
        skills_required,
        skills_preferred,
        created_at,
        companies (
          name,
          description,
          website,
          logo_url,
          industry,
          location
        )
      `)
      .eq('id', jobId)
      .eq('is_active', true)
      .single();

    if (error || !job) {
      return NextResponse.json({ 
        error: 'Job not found' 
      }, { status: 404 });
    }

    // Format the response to match the expected interface
    const formattedJob = {
      id: job.id,
      title: job.title,
      company: {
        name: job.companies?.name || 'Unknown Company'
      },
      jobType: job.job_type?.replace('_', '-') || 'Full-time',
      location: job.location || 'Remote',
      description: job.description || '',
      requirements: job.requirements || '',
      experienceLevel: job.experience_level,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      remoteAllowed: job.remote_allowed,
      skillsRequired: job.skills_required || [],
      skillsPreferred: job.skills_preferred || [],
      createdAt: job.created_at
    };

    return NextResponse.json(formattedJob);

  } catch (error) {
    console.error('Job fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 