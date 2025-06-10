import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { applicationId, jobId, resumeData } = await request.json();

    if (!applicationId || !jobId) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Generate interview questions based on job and resume
    const questions = await generateInterviewQuestions(jobId, resumeData);
    
    // Create interview session in database
    const { data: interview, error } = await supabase
      .from('interviews')
      .insert({
        application_id: applicationId,
        opportunity_id: jobId,
        candidate_id: resumeData?.candidateId, // You'd get this from the application
        status: 'scheduled',
        questions: questions,
        room_name: `interview_${applicationId}_${Date.now()}`
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating interview:', error);
      return NextResponse.json({ 
        error: 'Failed to create interview session' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      interviewId: interview.id,
      roomName: interview.room_name,
      questions: questions
    });

  } catch (error) {
    console.error('Interview creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function generateInterviewQuestions(jobId: string, resumeData: any) {
  // This would use OpenAI to generate personalized questions
  // For now, return some sample questions
  return [
    {
      id: 'q1',
      question: `Tell me about your experience with ${resumeData?.skills?.[0] || 'your main technical skills'}.`,
      category: 'technical'
    },
    {
      id: 'q2', 
      question: 'Describe a challenging project you\'ve worked on recently.',
      category: 'experience'
    },
    {
      id: 'q3',
      question: 'How do you handle working in a team environment?',
      category: 'behavioral'
    },
    {
      id: 'q4',
      question: 'What interests you most about this role?',
      category: 'motivation'
    },
    {
      id: 'q5',
      question: 'Where do you see your career heading in the next few years?',
      category: 'goals'
    }
  ];
} 