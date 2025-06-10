import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { resumeData, atsScore, filename } = await request.json();
    const applicationId = params.applicationId;

    if (!applicationId) {
      return NextResponse.json({ 
        error: 'Application ID is required' 
      }, { status: 400 });
    }

    // Update application with resume data
    const { data: application, error } = await supabase
      .from('applications')
      .update({
        resume_data: resumeData,
        status: 'resume_uploaded',
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating application:', error);
      return NextResponse.json({ 
        error: 'Failed to update application' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Resume data saved successfully',
      application
    });

  } catch (error) {
    console.error('Resume update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 