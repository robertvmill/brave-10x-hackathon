import OpenAI from 'openai';

// Types for interview system
interface InterviewConfig {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  experienceLevel: string;
  company: string;
}

interface InterviewMessage {
  id: string;
  type: 'question' | 'answer';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  analysis?: {
    sentiment: number;
    confidence: number;
    keyPoints: string[];
    skills_mentioned: string[];
  };
}

interface InterviewSession {
  id: string;
  jobId: string;
  userId: string;
  config: InterviewConfig;
  messages: InterviewMessage[];
  currentQuestionIndex: number;
  status: 'active' | 'completed' | 'paused';
  startTime: Date;
  transcript: string;
  finalAnalysis?: CandidateAnalysis;
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
}

class AIInterviewService {
  private openai: OpenAI;
  private elevenLabsApiKey: string;
  private deepgramApiKey: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
    this.elevenLabsApiKey = process.env.ELEVENLABS_API_KEY!;
    this.deepgramApiKey = process.env.DEEPGRAM_API_KEY!;
  }

  // Generate intelligent interview questions based on job and previous responses
  async generateNextQuestion(session: InterviewSession): Promise<string> {
    const systemPrompt = `You are a professional AI interviewer conducting a ${session.config.experienceLevel} ${session.config.jobTitle} interview for ${session.config.company}.

Job Requirements:
- Skills: ${session.config.requiredSkills.join(', ')}
- Experience Level: ${session.config.experienceLevel}

Previous conversation:
${session.messages.map(m => `${m.type}: ${m.content}`).join('\n')}

Generate the next interview question that:
1. Builds naturally on previous responses
2. Evaluates relevant technical/behavioral skills
3. Is conversational and engaging
4. Appropriate for the experience level
5. Helps assess culture fit

Respond with just the question, no additional text.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate the next interview question." }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0].message.content || "Tell me about your experience with this type of role.";
  }

  // Convert text to speech using ElevenLabs
  async synthesizeSpeech(text: string, voiceId: string = "21m00Tcm4TlvDq8ikWAM"): Promise<Blob> {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.elevenLabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.2,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to synthesize speech');
    }

    return await response.blob();
  }

  // Transcribe user speech using Deepgram
  async transcribeSpeech(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.deepgramApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to transcribe speech');
    }

    const result = await response.json();
    return result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
  }

  // Analyze candidate response
  async analyzeResponse(question: string, answer: string, jobConfig: InterviewConfig): Promise<InterviewMessage['analysis']> {
    const analysisPrompt = `Analyze this interview response for a ${jobConfig.jobTitle} position:

Question: ${question}
Answer: ${answer}

Required Skills: ${jobConfig.requiredSkills.join(', ')}

Provide analysis in JSON format:
{
  "sentiment": 0.0-1.0,
  "confidence": 0.0-1.0,
  "keyPoints": ["point1", "point2"],
  "skills_mentioned": ["skill1", "skill2"]
}`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert interview analyst. Respond only with valid JSON." },
        { role: "user", content: analysisPrompt }
      ],
      temperature: 0.3,
    });

    try {
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch {
      return {
        sentiment: 0.5,
        confidence: 0.5,
        keyPoints: [],
        skills_mentioned: []
      };
    }
  }

  // Generate final candidate analysis
  async generateFinalAnalysis(session: InterviewSession): Promise<CandidateAnalysis> {
    const transcript = session.messages
      .map(m => `${m.type.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const analysisPrompt = `Analyze this complete interview transcript for a ${session.config.jobTitle} position:

${transcript}

Job Requirements:
- Skills: ${session.config.requiredSkills.join(', ')}
- Experience Level: ${session.config.experienceLevel}
- Company: ${session.config.company}

Provide comprehensive analysis in JSON format:
{
  "overall_score": 0-100,
  "technical_skills": [{"skill": "JavaScript", "proficiency": 0-100}],
  "soft_skills": [{"skill": "Communication", "rating": 0-100}],
  "communication_score": 0-100,
  "experience_match": 0-100,
  "culture_fit": 0-100,
  "strengths": ["strength1", "strength2"],
  "areas_for_improvement": ["area1", "area2"],
  "summary": "Overall assessment summary",
  "recommendation": "strong_hire|hire|maybe|no_hire"
}`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert talent assessment AI. Provide detailed, objective analysis in valid JSON format." },
        { role: "user", content: analysisPrompt }
      ],
      temperature: 0.2,
    });

    try {
      return JSON.parse(response.choices[0].message.content || '{}') as CandidateAnalysis;
    } catch {
      return {
        overall_score: 50,
        technical_skills: [],
        soft_skills: [],
        communication_score: 50,
        experience_match: 50,
        culture_fit: 50,
        strengths: [],
        areas_for_improvement: [],
        summary: "Analysis unavailable",
        recommendation: "maybe"
      };
    }
  }

  // Generate embeddings for semantic search
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  }

  // Real-time speech processing with Deepgram WebSocket
  createRealtimeTranscription(onTranscript: (transcript: string) => void, onFinal: (transcript: string) => void) {
    // Implementation for real-time speech recognition
    // This would use Deepgram's WebSocket API for live transcription
    
    const websocket = new WebSocket(
      `wss://api.deepgram.com/v1/listen?model=nova-2&punctuate=true&smart_format=true`,
      ['token', this.deepgramApiKey]
    );

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'Results') {
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        if (transcript) {
          if (data.is_final) {
            onFinal(transcript);
          } else {
            onTranscript(transcript);
          }
        }
      }
    };

    return websocket;
  }
}

// Candidate Search Service using embeddings
class CandidateSearchService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  // Search candidates based on job requirements and interview data
  async searchCandidates(jobRequirements: string, skills: string[]): Promise<any[]> {
    // Generate embedding for the search query
    const queryEmbedding = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: `${jobRequirements} ${skills.join(' ')}`,
    });

    // This would query your database using vector similarity
    // Implementation depends on your database (PostgreSQL with pgvector, Supabase, etc.)
    
    return []; // Placeholder
  }

  // Match candidate skills to job requirements
  async calculateMatch(candidateProfile: any, jobRequirements: any): Promise<number> {
    const matchPrompt = `Calculate match percentage between candidate and job:

Candidate Skills: ${candidateProfile.skills?.join(', ')}
Candidate Experience: ${candidateProfile.experience}
Interview Summary: ${candidateProfile.interview_summary}

Job Requirements: ${jobRequirements.skills?.join(', ')}
Required Experience: ${jobRequirements.experience_level}

Return only a number between 0-100 representing match percentage.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a precise matching algorithm. Return only the match percentage number." },
        { role: "user", content: matchPrompt }
      ],
      temperature: 0.1,
    });

    return parseInt(response.choices[0].message.content || '0');
  }
}

export { AIInterviewService, CandidateSearchService };
export type { InterviewSession, InterviewConfig, CandidateAnalysis, InterviewMessage }; 