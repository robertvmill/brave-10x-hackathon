'use client'

import React, { useState, useEffect } from 'react'
import "@livekit/components-styles"
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
  RoomAudioRenderer,
} from "@livekit/components-react"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Mic, 
  MicOff, 
  Wifi, 
  WifiOff,
  RotateCcw,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'

interface JobData {
  title: string
  description: string
  requirements: string
  jobType: string
  experienceLevel: string
  salaryMin: number | null
  salaryMax: number | null
  location: string
  remoteAllowed: boolean
  skillsRequired: string[]
  skillsPreferred: string[]
}

// Audio Visualizer Component
function VoiceAssistantVisualizer() {
  const { state, audioTrack } = useVoiceAssistant()
  
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      {/* Audio Visualizer */}
      <div className="h-32 w-full max-w-md flex items-center justify-center">
        <BarVisualizer 
          state={state} 
          barCount={7} 
          trackRef={audioTrack} 
          className="h-full w-full"
        />
      </div>
      
      {/* State Display */}
      <div className="text-center space-y-2">
        <Badge 
          variant={state === 'speaking' ? 'default' : state === 'listening' ? 'secondary' : 'outline'}
          className="text-sm px-4 py-1"
        >
          {state === 'speaking' && '🎤 AI Speaking'}
          {state === 'listening' && '👂 Listening'}
          {state === 'thinking' && '🤔 Processing'}
          {String(state) === 'idle' && '⏸️ Ready'}
          {state === 'connecting' && '🔗 Connecting'}
          {!state && '⚪ Standby'}
        </Badge>
        
        <p className="text-sm text-muted-foreground">
          {state === 'speaking' && 'AI is responding to your request'}
          {state === 'listening' && 'Speak naturally about your job posting'}
          {state === 'thinking' && 'Processing your message'}
          {String(state) === 'idle' && 'Click the microphone to start speaking'}
          {state === 'connecting' && 'Establishing connection'}
          {!state && 'Voice assistant ready'}
        </p>
      </div>
      
      {/* Voice Control Bar */}
      <VoiceAssistantControlBar className="mt-6" />
    </div>
  )
}

// Main Room Component
function VoiceAssistantRoom() {
  const { user } = useAuth()
  const [token, setToken] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string>('Not Started')
  const [jobData, setJobData] = useState<JobData>({
    title: '',
    description: '',
    requirements: '',
    jobType: '',
    experienceLevel: '',
    salaryMin: null,
    salaryMax: null,
    location: '',
    remoteAllowed: false,
    skillsRequired: [],
    skillsPreferred: []
  })

  // Generate token for LiveKit connection
  const generateToken = async () => {
    setIsConnecting(true)
    
    try {
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: `recruiter-${user?.id || 'anonymous'}`,
          room: 'voice-job-assistant'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate token')
      }

      const { token } = await response.json()
      setToken(token)
    } catch (error) {
      console.error('Error generating token:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  // Generate token on mount
  useEffect(() => {
    generateToken()
  }, [user])

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">
          {isConnecting ? 'Connecting to voice assistant...' : 'Preparing voice assistant...'}
        </p>
      </div>
    )
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://hirehub-epnu8ba6.livekit.cloud'}
      data-lk-theme="default"
      className="h-full"
    >
      <VoiceAssistantVisualizer />
      <RoomAudioRenderer />
    </LiveKitRoom>
  )
}

export default function RealtimeVoiceAssistant() {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string>('Not Started')
  const [jobData, setJobData] = useState<JobData>({
    title: '',
    description: '',
    requirements: '',
    jobType: '',
    experienceLevel: '',
    salaryMin: null,
    salaryMax: null,
    location: '',
    remoteAllowed: false,
    skillsRequired: [],
    skillsPreferred: []
  })

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Mic className="h-5 w-5" />
          OpenAI Realtime Voice Assistant
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Professional voice-powered job posting with OpenAI Realtime API and LiveKit
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Bar */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <Badge variant="outline" className="text-xs">
            Step: {currentStep}
          </Badge>
          
          {progress > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{progress}% Complete</span>
              <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Voice Assistant Room */}
        <VoiceAssistantRoom />

        {/* Job Data Preview */}
        {jobData.title && (
          <div className="border rounded-lg p-4 bg-background/50 shadow-sm">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              📝 Job Posting Preview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {jobData.title && <div><strong>Title:</strong> {jobData.title}</div>}
              {jobData.jobType && <div><strong>Type:</strong> {jobData.jobType.replace('_', '-')}</div>}
              {jobData.experienceLevel && <div><strong>Level:</strong> {jobData.experienceLevel}</div>}
              {jobData.location && <div><strong>Location:</strong> {jobData.location}</div>}
              {jobData.remoteAllowed && <div><strong>Remote:</strong> Yes</div>}
              {(jobData.salaryMin || jobData.salaryMax) && (
                <div><strong>Salary:</strong> 
                  {jobData.salaryMin && jobData.salaryMax 
                    ? `$${jobData.salaryMin.toLocaleString()} - $${jobData.salaryMax.toLocaleString()}`
                    : jobData.salaryMin 
                      ? `From $${jobData.salaryMin.toLocaleString()}`
                      : `Up to $${jobData.salaryMax?.toLocaleString()}`
                  }
                </div>
              )}
              {jobData.skillsRequired.length > 0 && (
                <div className="md:col-span-2">
                  <strong>Required Skills:</strong> {jobData.skillsRequired.join(', ')}
                </div>
              )}
              {jobData.skillsPreferred.length > 0 && (
                <div className="md:col-span-2">
                  <strong>Preferred Skills:</strong> {jobData.skillsPreferred.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 