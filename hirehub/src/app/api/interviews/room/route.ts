import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { applicationId, jobData, resumeData } = await request.json();

    if (!applicationId || !jobData || !resumeData) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Generate unique room name for this interview
    const roomName = `interview_${applicationId}_${Date.now()}`;
    
    // Create interview record in database
    const { data: application } = await supabase
      .from('applications')
      .select('candidate_id, opportunity_id')
      .eq('id', applicationId)
      .single();

    if (!application) {
      return NextResponse.json({ 
        error: 'Application not found' 
      }, { status: 404 });
    }

    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .insert({
        application_id: applicationId,
        candidate_id: application.candidate_id,
        opportunity_id: application.opportunity_id,
        status: 'scheduled',
        room_name: roomName,
        questions: generateInterviewQuestions(jobData, resumeData)
      })
      .select()
      .single();

    if (interviewError) {
      console.error('Error creating interview:', interviewError);
      return NextResponse.json({ 
        error: 'Failed to create interview record' 
      }, { status: 500 });
    }

    // Create LiveKit access token for the candidate
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: `candidate_${application.candidate_id}`,
        name: resumeData.name || 'Candidate'
      }
    );

    // Grant permissions
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomCreate: true
    });

    // Add room metadata with job and resume data for the agent
    const roomMetadata = {
      job_data: jobData,
      resume_data: resumeData,
      interview_id: interview.id,
      application_id: applicationId
    };

    return NextResponse.json({
      token: token.toJwt(),
      roomName,
      interviewId: interview.id,
      metadata: roomMetadata,
      wsUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL!
    });

  } catch (error) {
    console.error('Room creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

function generateInterviewQuestions(jobData: any, resumeData: any) {
  const jobTitle = jobData.title || 'this position';
  const companyName = jobData.company?.name || 'our company';
  const candidateSkills = resumeData.skills || [];
  const jobSkills = jobData.skillsRequired || [];
  
  // Find skill overlap for targeted questions
  const overlappingSkills = candidateSkills.filter((skill: string) => 
    jobSkills.some((jobSkill: string) => 
      skill.toLowerCase().includes(jobSkill.toLowerCase()) || 
      jobSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  const primarySkill = overlappingSkills[0] || candidateSkills[0] || 'your technical skills';

  return [
    {
      id: 'intro',
      question: `Hello! Welcome to your interview for the ${jobTitle} position at ${companyName}. To start, could you please introduce yourself and tell me why you're interested in this role?`,
      category: 'introduction',
      expected_duration: 60
    },
    {
      id: 'technical',
      question: `I see you have experience with ${primarySkill}. Can you walk me through a specific project where you used ${primarySkill} and describe the challenges you faced?`,
      category: 'technical',
      expected_duration: 90
    },
    {
      id: 'experience',
      question: `How do you think your background and experience align with what we're looking for in this ${jobTitle} role?`,
      category: 'experience',
      expected_duration: 75
    },
    {
      id: 'problem_solving',
      question: 'Describe a time when you had to solve a difficult technical problem. What was your approach and what did you learn from it?',
      category: 'problem_solving',
      expected_duration: 90
    },
    {
      id: 'teamwork',
      question: `At ${companyName}, collaboration is important. Can you tell me about a time when you worked effectively with a team to achieve a goal?`,
      category: 'behavioral',
      expected_duration: 75
    },
    {
      id: 'goals',
      question: 'Where do you see your career heading in the next few years, and how does this position fit into those goals?',
      category: 'career_goals',
      expected_duration: 60
    }
  ];
} 