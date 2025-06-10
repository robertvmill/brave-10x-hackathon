import { useState } from 'react';
import { 
  Room, 
  RoomEvent, 
  RemoteParticipant, 
  TrackPublication,
  Track
} from 'livekit-client';

// Interview configuration types
interface LiveKitInterviewConfig {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  experienceLevel: string;
  company: string;
  duration?: number; // minutes
}

interface InterviewSession {
  id: string;
  roomName: string;
  participantToken: string;
  agentToken: string;
  config: LiveKitInterviewConfig;
  status: 'pending' | 'active' | 'completed';
  startTime?: Date;
  transcript: string;
  analysis?: CandidateAnalysis;
  wsUrl: string; // Include WebSocket URL in session
}

interface CandidateAnalysis {
  overall_score: number;
  technical_skills: { skill: string; proficiency: number }[];
  soft_skills: { skill: string; rating: number }[];
  communication_score: number;
  experience_match: number;
  culture_fit: number;
  strengths: string[];
  areas_for_improvement: string[];
  summary: string;
  recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire';
  interview_duration: number;
  response_quality: number;
  engagement_level: number;
}

class LiveKitInterviewService {
  // Remove server-side environment access from client-side service
  // Tokens and URLs will come from the session object instead

  // Start AI agent for the interview
  async startInterviewAgent(session: InterviewSession): Promise<void> {
    // Call API endpoint to start the agent
    const agentConfig = {
      roomName: session.roomName,
      token: session.agentToken,
      systemPrompt: this.generateSystemPrompt(session.config),
      interviewConfig: session.config
    };

    await fetch('/api/interviews/start-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentConfig)
    });
  }

  // Generate system prompt for the AI interviewer
  private generateSystemPrompt(config: LiveKitInterviewConfig): string {
    return `You are a professional AI interviewer conducting a ${config.experienceLevel} level interview for a ${config.jobTitle} position at ${config.company}.

INTERVIEW GUIDELINES:
- Be conversational and engaging
- Ask follow-up questions based on responses
- Evaluate technical skills: ${config.requiredSkills.join(', ')}
- Assess communication, problem-solving, and culture fit
- Keep questions relevant to the experience level
- Conduct approximately 5-7 questions over 15-20 minutes
- Be encouraging but maintain professionalism

JOB CONTEXT:
Position: ${config.jobTitle}
Company: ${config.company}
Required Skills: ${config.requiredSkills.join(', ')}
Experience Level: ${config.experienceLevel}
Description: ${config.jobDescription}

CONVERSATION FLOW:
1. Start with a warm greeting and brief introduction
2. Ask the candidate to introduce themselves
3. Explore their relevant experience and skills
4. Ask behavioral and technical questions
5. Conclude with next steps and thank them

Maintain a natural conversation flow and adjust questions based on their responses. Be supportive and help them showcase their best qualities.`;
  }

  // Connect to LiveKit room using session data
  async connectToRoom(session: InterviewSession): Promise<Room> {
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      publishDefaults: {
        videoCodec: 'vp9',
        audioCodec: 'opus',
      }
    });

    await room.connect(session.wsUrl, session.participantToken);
    return room;
  }

  // Set up room event handlers for interview
  setupInterviewHandlers(
    room: Room, 
    onTranscriptUpdate: (transcript: string) => void,
    onInterviewComplete: (analysis: CandidateAnalysis) => void
  ): void {
    
    // Handle agent joining
    room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log('Participant connected:', participant.identity);
      
      if (participant.identity === 'ai_interviewer') {
        console.log('AI Interviewer joined the room');
        this.subscribeToAgent(participant, onTranscriptUpdate);
      }
    });

    // Handle transcript updates from agent
    room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
      const data = JSON.parse(new TextDecoder().decode(payload));
      
      if (data.type === 'transcript') {
        onTranscriptUpdate(data.text);
      } else if (data.type === 'interview_complete') {
        onInterviewComplete(data.analysis);
      }
    });

    // Handle track subscriptions
    room.on(RoomEvent.TrackSubscribed, (track: Track, publication: TrackPublication, participant: RemoteParticipant) => {
      if (participant.identity === 'ai_interviewer' && track.kind === 'audio') {
        // Auto-play AI interviewer audio
        const audioElement = track.attach();
        audioElement.play();
        document.body.appendChild(audioElement);
      }
    });
  }

  // Subscribe to agent's audio and data tracks
  private subscribeToAgent(participant: RemoteParticipant, onTranscript: (text: string) => void): void {
    participant.trackPublications.forEach((publication) => {
      if (publication.track) {
        if (publication.track.kind === 'audio') {
          const audioElement = publication.track.attach();
          audioElement.play();
          document.body.appendChild(audioElement);
        }
      }
    });
  }

  // Send message to AI agent
  async sendToAgent(room: Room, message: any): Promise<void> {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(message));
    await room.localParticipant.publishData(data, { reliable: true });
  }

  // Complete interview and get analysis
  async completeInterview(
    room: Room, 
    transcript: string, 
    duration: number
  ): Promise<CandidateAnalysis> {
    // Request final analysis from agent
    await this.sendToAgent(room, {
      type: 'complete_interview',
      transcript,
      duration
    });

    // The analysis will be received via DataReceived event
    // This is handled in setupInterviewHandlers
    
    // Return placeholder - real analysis comes through events
    return {
      overall_score: 0,
      technical_skills: [],
      soft_skills: [],
      communication_score: 0,
      experience_match: 0,
      culture_fit: 0,
      strengths: [],
      areas_for_improvement: [],
      summary: 'Analysis in progress...',
      recommendation: 'maybe',
      interview_duration: duration,
      response_quality: 0,
      engagement_level: 0
    };
  }

  // Cleanup room connection
  async disconnectFromRoom(room: Room): Promise<void> {
    await room.disconnect();
  }
}

// Frontend hook for React components
export function useLiveKitInterview() {
  const [service] = useState(() => new LiveKitInterviewService());
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<CandidateAnalysis | null>(null);

  const startInterview = async (session: InterviewSession) => {
    try {
      const newRoom = await service.connectToRoom(session);
      
      service.setupInterviewHandlers(
        newRoom,
        (newTranscript) => setTranscript(prev => prev + '\n' + newTranscript),
        (finalAnalysis) => setAnalysis(finalAnalysis)
      );

      setRoom(newRoom);
      setIsConnected(true);

      // Start the AI agent
      await service.startInterviewAgent(session);
      
    } catch (error) {
      console.error('Failed to start interview:', error);
      throw error;
    }
  };

  const endInterview = async () => {
    if (room) {
      await service.disconnectFromRoom(room);
      setRoom(null);
      setIsConnected(false);
    }
  };

  return {
    service,
    room,
    isConnected,
    transcript,
    analysis,
    startInterview,
    endInterview
  };
}

export { LiveKitInterviewService };
export type { LiveKitInterviewConfig, InterviewSession, CandidateAnalysis }; 