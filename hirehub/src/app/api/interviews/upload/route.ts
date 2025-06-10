import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const jobId = formData.get('jobId') as string;
    const userId = formData.get('userId') as string;
    const duration = formData.get('duration') as string;

    if (!videoFile || !jobId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await videoFile.arrayBuffer();
    const fileName = `interviews/${userId}/${jobId}_${Date.now()}.webm`;

    // Upload video to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('interview-videos')
      .upload(fileName, arrayBuffer, {
        contentType: 'video/webm',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload video' },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded video
    const { data: { publicUrl } } = supabase.storage
      .from('interview-videos')
      .getPublicUrl(fileName);

    // Save interview record to database
    const { data: interviewData, error: dbError } = await supabase
      .from('interviews')
      .insert({
        job_id: jobId,
        user_id: userId,
        video_url: publicUrl,
        duration: parseInt(duration),
        status: 'completed',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save interview record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      interviewId: interviewData.id,
      videoUrl: publicUrl
    });

  } catch (error) {
    console.error('Error processing interview upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 