# LiveKit Voice Assistant Integration Guide

## Overview

This guide demonstrates how to enhance the voice job posting assistant using LiveKit's real-time audio processing capabilities. LiveKit provides superior audio quality, noise cancellation, and cross-platform compatibility compared to browser-only Speech APIs.

## Benefits of LiveKit Integration

### 🎯 **Enhanced Audio Quality**
- Professional-grade noise cancellation
- Echo suppression
- Automatic gain control
- Higher sample rates (up to 48kHz)

### 🌐 **Better Browser Compatibility**
- Works across all modern browsers
- Consistent experience on mobile devices
- No dependency on browser speech APIs

### 🚀 **Real-time Processing**
- Low-latency audio streaming
- Real-time transcription with confidence scores
- Bidirectional audio communication

### 🔧 **Advanced Features**
- Connection quality monitoring
- Automatic reconnection handling
- Audio level monitoring
- Multiple participant support (future expansion)

## Implementation Architecture

```
Frontend (React)     LiveKit Cloud/Server     AI Services
     │                       │                    │
     ├─ Audio Capture ──────►│◄─── WebRTC ──────►│
     ├─ UI Components        │                    ├─ Speech-to-Text
     ├─ Job Data State       │                    ├─ Text-to-Speech  
     └─ LiveKit Client ──────┘                    └─ NLP Processing
```

## Step-by-Step Integration

### 1. LiveKit Server Setup

You have two options:

#### Option A: LiveKit Cloud (Recommended for quick start)
```typescript
// src/config/livekit.ts
export const LIVEKIT_CONFIG = {
  url: 'wss://your-project.livekit.cloud',
  apiKey: process.env.NEXT_PUBLIC_LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
}
```

#### Option B: Self-hosted LiveKit Server
```bash
# Docker setup
docker run --rm \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  -e LIVEKIT_KEYS="devkey: devsecret" \
  livekit/livekit-server:latest
```

### 2. Enhanced Voice Assistant Component

```typescript
// src/components/enhanced-voice-assistant.tsx
import { Room, connect, createLocalAudioTrack, RemoteAudioTrack } from 'livekit-client'
import { useCallback, useEffect, useRef, useState } from 'react'

export function EnhancedVoiceAssistant() {
  const [room, setRoom] = useState<Room | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null)
  
  const connectToRoom = useCallback(async () => {
    try {
      // Generate access token (server-side)
      const token = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identity: `recruiter-${user.id}`,
          room: 'voice-assistant' 
        })
      }).then(res => res.json())

      // Connect to LiveKit room
      const newRoom = new Room({
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
        adaptiveStream: true,
        disconnectOnPageLeave: true,
      })

      await newRoom.connect(LIVEKIT_CONFIG.url, token)
      
      // Set up event handlers
      newRoom.on('participantConnected', handleParticipantConnected)
      newRoom.on('trackSubscribed', handleTrackSubscribed)
      newRoom.on('disconnected', handleDisconnected)
      
      setRoom(newRoom)
      setIsConnected(true)
      
    } catch (error) {
      console.error('Failed to connect to LiveKit:', error)
      // Fallback to Web Speech API
      initializeFallbackMode()
    }
  }, [])

  const startVoiceCapture = useCallback(async () => {
    if (!room) return

    try {
      // Create high-quality audio track
      const track = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
      })

      // Publish to room for AI processing
      await room.localParticipant.publishTrack(track)
      setAudioTrack(track)
      
    } catch (error) {
      console.error('Failed to start audio capture:', error)
    }
  }, [room])

  // Handle real-time transcription
  const handleTrackSubscribed = useCallback((
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => {
    if (track.kind === Track.Kind.Audio) {
      // This would be the AI assistant's voice response
      const audioElement = track.attach()
      document.body.appendChild(audioElement)
    }
  }, [])

  return (
    // Enhanced UI with LiveKit features
    <VoiceAssistantUI 
      isConnected={isConnected}
      onConnect={connectToRoom}
      onStartCapture={startVoiceCapture}
      connectionQuality={room?.connectionQuality}
    />
  )
}
```

### 3. Server-side Token Generation

```typescript
// src/app/api/livekit/token/route.ts
import { AccessToken } from 'livekit-server-sdk'

export async function POST(request: Request) {
  const { identity, room } = await request.json()
  
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity }
  )
  
  token.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  })
  
  return Response.json({ token: token.toJwt() })
}
```

### 4. AI Processing Pipeline

```typescript
// src/services/voice-processing.ts
export class VoiceProcessingService {
  private room: Room
  private transcriptionService: TranscriptionService
  private ttsService: TextToSpeechService

  async processAudioStream(audioTrack: RemoteAudioTrack) {
    // Real-time transcription
    const transcription = await this.transcriptionService.transcribe(audioTrack)
    
    // Process job posting logic
    const response = await this.processJobIntent(transcription)
    
    // Generate AI response
    const audioResponse = await this.ttsService.synthesize(response)
    
    // Stream back to client
    await this.room.localParticipant.publishTrack(audioResponse)
  }

  private async processJobIntent(text: string) {
    // Enhanced NLP processing for job posting creation
    const intent = await this.nlpService.extractIntent(text)
    
    switch (intent.type) {
      case 'job_title':
        return this.handleJobTitle(intent.value)
      case 'job_description':
        return this.handleJobDescription(intent.value)
      // ... other intents
    }
  }
}
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud

# Optional: External AI services
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
DEEPGRAM_API_KEY=your_deepgram_key
```

## Advanced Features

### 1. Real-time Audio Visualization

```typescript
const AudioVisualizer = ({ audioTrack }: { audioTrack: LocalAudioTrack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!audioTrack || !canvasRef.current) return
    
    const analyser = audioTrack.getAnalyser()
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    const animate = () => {
      analyser.getByteFrequencyData(dataArray)
      // Draw audio waveform visualization
      drawWaveform(canvasRef.current, dataArray)
      requestAnimationFrame(animate)
    }
    
    animate()
  }, [audioTrack])
  
  return <canvas ref={canvasRef} className="w-full h-20" />
}
```

### 2. Multi-language Support

```typescript
const VoiceAssistant = () => {
  const [language, setLanguage] = useState('en-US')
  
  const configureLanguage = useCallback(async (lang: string) => {
    await room?.localParticipant.setMetadata(JSON.stringify({ 
      language: lang,
      transcriptionModel: `deepgram-${lang}` 
    }))
  }, [room])
  
  return (
    <LanguageSelector 
      languages={['en-US', 'es-ES', 'fr-FR', 'de-DE']}
      onSelect={configureLanguage}
    />
  )
}
```

### 3. Connection Quality Monitoring

```typescript
const ConnectionMonitor = ({ room }: { room: Room }) => {
  const [quality, setQuality] = useState<ConnectionQuality>()
  
  useEffect(() => {
    if (!room) return
    
    const handleQualityChange = (quality: ConnectionQuality) => {
      setQuality(quality)
      
      // Automatically adjust audio quality based on connection
      if (quality === ConnectionQuality.Poor) {
        room.localParticipant.setTrackSubscriptionPermissions(false)
      }
    }
    
    room.on('connectionQualityChanged', handleQualityChange)
    return () => room.off('connectionQualityChanged', handleQualityChange)
  }, [room])
  
  return (
    <ConnectionIndicator 
      quality={quality}
      showDetails={true}
    />
  )
}
```

## Deployment Considerations

### 1. Scaling Strategy
- Use LiveKit Cloud for automatic scaling
- Deploy regional servers for global users
- Implement load balancing for high traffic

### 2. Cost Optimization
- Monitor connection minutes and bandwidth usage
- Implement smart disconnection policies
- Use adaptive bitrates based on network conditions

### 3. Security Best Practices
- Generate short-lived access tokens (15-30 minutes)
- Validate user permissions before token generation
- Implement rate limiting on voice endpoints
- Use HTTPS/WSS for all connections

## Testing Strategy

```typescript
// src/__tests__/voice-assistant.test.ts
describe('LiveKit Voice Assistant', () => {
  let mockRoom: jest.Mocked<Room>
  
  beforeEach(() => {
    mockRoom = createMockRoom()
  })
  
  test('should connect to LiveKit room successfully', async () => {
    const assistant = new VoiceAssistant()
    await assistant.connect()
    
    expect(mockRoom.connect).toHaveBeenCalledWith(
      expect.stringContaining('wss://'),
      expect.any(String)
    )
  })
  
  test('should handle audio track publishing', async () => {
    const assistant = new VoiceAssistant()
    await assistant.startVoiceCapture()
    
    expect(mockRoom.localParticipant.publishTrack).toHaveBeenCalled()
  })
})
```

## Migration Path

### Phase 1: Parallel Implementation
- Keep existing Web Speech API as fallback
- Add LiveKit as enhanced option
- A/B test with user segments

### Phase 2: Feature Enhancement
- Add real-time transcription confidence scores
- Implement voice quality indicators
- Add multi-participant support for team interviews

### Phase 3: Full Migration
- Make LiveKit the primary voice solution
- Remove Web Speech API dependencies
- Optimize for production performance

## Monitoring and Analytics

```typescript
// src/services/voice-analytics.ts
export class VoiceAnalytics {
  trackVoiceSession(sessionId: string, metrics: {
    duration: number
    audioQuality: ConnectionQuality
    transcriptionAccuracy: number
    completionRate: number
  }) {
    // Send to analytics service
    analytics.track('voice_session_completed', {
      session_id: sessionId,
      ...metrics
    })
  }
  
  trackError(error: VoiceError) {
    // Monitor voice-related errors
    errorTracking.captureException(error)
  }
}
```

This integration provides a robust, scalable foundation for voice-powered job posting that significantly improves upon browser-only speech APIs while maintaining fallback compatibility. 