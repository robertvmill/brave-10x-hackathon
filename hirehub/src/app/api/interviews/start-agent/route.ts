import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { roomName, token, systemPrompt, interviewConfig } = await request.json();

    if (!roomName || !token || !systemPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`🤖 Starting simulated LiveKit agent for room: ${roomName}`);
    console.log(`📝 Interview config:`, interviewConfig);

    // Simulate agent startup delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real setup, this would start your Python LiveKit agent
    // For demonstration, we'll simulate the agent being ready
    
    console.log(`✅ Simulated agent ready for room: ${roomName}`);
    console.log(`💬 Agent will simulate responses (no real voice AI yet)`);
    console.log(`🔧 To enable real voice AI, run: python livekit-agent.py`);

    return NextResponse.json({
      success: true,
      message: 'Interview agent simulation started',
      roomName,
      agentStatus: 'simulated',
      note: 'This is a demo mode. For real voice AI, install LiveKit agents and run the Python script.'
    });

  } catch (error) {
    console.error('Error starting interview agent:', error);
    return NextResponse.json(
      { error: 'Failed to start interview agent' },
      { status: 500 }
    );
  }
} 