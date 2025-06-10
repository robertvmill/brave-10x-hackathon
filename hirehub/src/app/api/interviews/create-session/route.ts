import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function POST(request: NextRequest) {
  try {
    const { userId, jobId, jobTitle, company, requiredSkills, experienceLevel, jobDescription } = await request.json();

    if (!userId || !jobId || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: 'LiveKit credentials not configured' },
        { status: 500 }
      );
    }

    // Generate unique room name
    const roomName = `interview_${jobId}_${userId}_${Date.now()}`;

    // Generate participant token
    const participantToken = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: `Candidate_${userId}`,
      ttl: '2h',
    });

    participantToken.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // Generate agent token
    const agentToken = new AccessToken(apiKey, apiSecret, {
      identity: 'ai_interviewer',
      name: 'AI Interviewer',
      ttl: '2h',
    });

    agentToken.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const session = {
      id: `session_${Date.now()}`,
      roomName,
      participantToken: await participantToken.toJwt(),
      agentToken: await agentToken.toJwt(),
      config: {
        jobTitle,
        jobDescription: jobDescription || '',
        requiredSkills: requiredSkills || [],
        experienceLevel: experienceLevel || 'Mid',
        company,
        duration: 30
      },
      status: 'pending',
      transcript: '',
      wsUrl: wsUrl
    };

    return NextResponse.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Error creating LiveKit session:', error);
    return NextResponse.json(
      { error: 'Failed to create interview session' },
      { status: 500 }
    );
  }
} 