# AI Interview Implementation Guide

## Overview
This implementation provides a complete AI-powered video interview system similar to Mercor's interface. It includes video recording, AI conversation, and automatic storage to Supabase.

## Features Implemented

### ✅ Core Features
- **Professional video interview interface** (Zoom-style)
- **Real-time video recording** with WebRTC
- **AI voice synthesis** using Web Speech API (expandable)
- **Automatic video upload** to Supabase Storage
- **Interview progress tracking**
- **Media controls** (camera/microphone toggle)
- **Professional UI/UX** matching your app design

### 🔧 Current AI Implementation
- **Basic AI interviewer** with predefined questions
- **Text-to-speech** using Web Speech API
- **Question progression** system
- **Interview timing** and duration tracking

## File Structure
```
hirehub/src/app/
├── interviews/
│   └── [jobId]/
│       ├── page.tsx           # Interview preparation page
│       └── live/
│           └── page.tsx       # Live video interview
└── api/
    └── interviews/
        └── upload/
            └── route.ts       # Video upload API
```

## Setup Instructions

### 1. Supabase Configuration

#### Create Storage Bucket
```sql
-- Create interview-videos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('interview-videos', 'interview-videos', true);
```

#### Create Interviews Table
```sql
CREATE TABLE interviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id text NOT NULL,
  user_id text NOT NULL,
  video_url text NOT NULL,
  duration integer NOT NULL,
  status text DEFAULT 'completed',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interviews" ON interviews
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own interviews" ON interviews
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);
```

#### Storage Policies
```sql
-- Allow authenticated users to upload interview videos
CREATE POLICY "Authenticated users can upload interview videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'interview-videos' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to view their own interview videos
CREATE POLICY "Users can view their own interview videos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'interview-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 2. Environment Variables
Add to your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Advanced AI Integration Options

### Option 1: OpenAI Realtime API (Recommended)
```typescript
// Example integration with OpenAI Realtime API
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const startRealTimeInterview = async () => {
  const response = await openai.chat.completions.create({
    model: "gpt-4-realtime-preview",
    messages: [
      {
        role: "system",
        content: "You are a professional AI interviewer. Conduct a technical interview..."
      }
    ],
    stream: true,
  });
  
  // Handle real-time responses
};
```

### Option 2: ElevenLabs + OpenAI
```typescript
// Advanced AI voice integration
const speakWithElevenLabs = async (text: string) => {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/voice-id', {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    }),
  });
  
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
};
```

### Option 3: Deepgram Speech-to-Text
```typescript
// Real-time speech transcription
import { Deepgram } from '@deepgram/sdk';

const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

const startTranscription = (stream: MediaStream) => {
  const connection = deepgram.listen.live({
    model: 'nova-2',
    language: 'en-US',
    smart_format: true,
    punctuate: true,
  });

  connection.on('transcript', (data) => {
    console.log('Transcript:', data.channel.alternatives[0].transcript);
  });
};
```

## Usage Flow

1. **User applies for job** → Redirected to interview preparation
2. **Preparation page** → System checks, guidelines, job info
3. **Start interview** → Redirected to live interview page
4. **Live interview** → Video recording, AI questions, real-time interaction
5. **End interview** → Video automatically uploaded to Supabase
6. **Interview record** → Saved to database with metadata

## Browser Compatibility

### Supported Features
- **WebRTC**: Chrome 56+, Firefox 52+, Safari 15+
- **MediaRecorder**: Chrome 47+, Firefox 25+, Safari 14.1+
- **getUserMedia**: Chrome 53+, Firefox 38+, Safari 11+

### Required Permissions
- Camera access
- Microphone access
- HTTPS connection (required for WebRTC)

## Security Considerations

1. **HTTPS Required**: WebRTC APIs require secure context
2. **CORS Configuration**: Ensure proper CORS setup for Supabase
3. **File Size Limits**: Implement reasonable video file size limits
4. **Access Control**: Use Supabase RLS for interview data protection

## Performance Optimization

### Video Quality Settings
```typescript
const constraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30, max: 30 },
    facingMode: 'user'
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100
  }
};
```

### Compression Options
```typescript
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'video/webm;codecs=vp9',
  videoBitsPerSecond: 2500000, // 2.5 Mbps
  audioBitsPerSecond: 128000   // 128 kbps
});
```

## Next Steps

1. **Integrate advanced AI APIs** (OpenAI Realtime, ElevenLabs)
2. **Add speech-to-text** for candidate response analysis
3. **Implement AI scoring** based on responses
4. **Add interview analytics** and feedback reports
5. **Create admin dashboard** for reviewing interviews

## Troubleshooting

### Common Issues
1. **Camera/Mic Access Denied**: Ensure HTTPS and proper permissions
2. **Upload Failures**: Check Supabase storage policies and bucket setup
3. **Audio Issues**: Verify Web Speech API support in browser
4. **Recording Errors**: Check MediaRecorder API compatibility

### Debug Mode
Add this to enable detailed logging:
```typescript
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('Interview state:', interviewState);
  console.log('Media stream:', streamRef.current);
}
```

## API Endpoints

### POST /api/interviews/upload
Uploads interview video to Supabase and creates database record.

**Request:**
- `video`: Video file (FormData)
- `jobId`: Job identifier
- `userId`: User identifier
- `duration`: Interview duration in seconds

**Response:**
```json
{
  "success": true,
  "interviewId": "uuid",
  "videoUrl": "https://..."
}
```

This implementation provides a solid foundation for AI-powered video interviews that can be easily extended with advanced AI capabilities! 