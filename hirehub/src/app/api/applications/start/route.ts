import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { candidateId, opportunityId } = await request.json();

    if (!candidateId || !opportunityId) {
      return NextResponse.json({ 
        error: 'Missing candidateId or opportunityId' 
      }, { status: 400 });
    }

    // Get job details to find the recruiter
    const { data: job, error: jobError } = await supabase
      .from('job_opportunities')
      .select('recruiter_id, title, company_id')
      .eq('id', opportunityId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ 
        error: 'Job not found' 
      }, { status: 404 });
    }

    // Check if application already exists
    const { data: existingApp } = await supabase
      .from('applications')
      .select('id, status')
      .eq('candidate_id', candidateId)
      .eq('opportunity_id', opportunityId)
      .single();

    if (existingApp) {
      return NextResponse.json({ 
        applicationId: existingApp.id,
        status: existingApp.status,
        message: 'Application already exists'
      });
    }

    // Create new application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        candidate_id: candidateId,
        opportunity_id: opportunityId,
        recruiter_id: job.recruiter_id,
        status: 'draft'
      })
      .select()
      .single();

    if (appError) {
      console.error('Error creating application:', appError);
      return NextResponse.json({ 
        error: 'Failed to create application' 
      }, { status: 500 });
    }

    return NextResponse.json({
      applicationId: application.id,
      status: 'draft',
      message: 'Application started successfully'
    });

  } catch (error) {
    console.error('Application start error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 