'use client'

import React, { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Square,
  Circle,
  Clock,
  User,
  Volume2,
  PhoneOff,
  AlertCircle
} from "lucide-react";
import { LiveKitInterviewConfig, InterviewSession } from "@/lib/livekit-interview";
import { 
  AudioTrack, 
  VideoTrack, 
  useLocalParticipant, 
  useConnectionState,
  ConnectionState,
  RoomAudioRenderer,
  LiveKitRoom
} from '@livekit/components-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  jobType: string;
  experienceLevel: string | null;
  description?: string;
  skillsRequired: string[];
}

interface InterviewState {
  isActive: boolean;
  duration: number;
  currentPhase: 'connecting' | 'intro' | 'questions' | 'closing' | 'completed' | 'demo';
  status: string;
  isDemoMode: boolean;
}

export default function LiveInterviewPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionError, setConnectionError] = useState('');
  
  // LiveKit interview state (simplified)
  const [isConnected, setIsConnected] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null)
  const [interviewState, setInterviewState] = useState<InterviewState>({
    isActive: false,
    duration: 0,
    currentPhase: 'connecting',
    status: 'Preparing interview...',
    isDemoMode: false
  })
  
  // Media controls
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  // Demo mode simulation
  const [demoTranscript, setDemoTranscript] = useState('');
  const demoQuestions = [
    "Hello! Welcome to your interview for the Software Engineer position. Can you please introduce yourself?",
    "That's great! Can you tell me about your experience with the technologies mentioned in this role?",
    "Excellent. How do you approach problem-solving when faced with a technical challenge?",
    "Thank you for sharing that. What interests you most about working with our team?",
    "Perfect! Do you have any questions about the role or our company culture?"
  ];
  const [currentDemoQuestion, setCurrentDemoQuestion] = useState(0);

  // Timer for interview duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (interviewState.isActive) {
      interval = setInterval(() => {
        setInterviewState(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [interviewState.isActive]);

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          throw new Error('Job not found');
        }
        const jobData = await response.json();
        setJob(jobData);
      } catch (err) {
        setError('Failed to load job details. Please try again later.');
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // Create interview session when job loads
  useEffect(() => {
    if (job && user && !interviewSession) {
      createInterviewSession();
    }
  }, [job, user]);

  const createInterviewSession = async () => {
    if (!job || !user) return;

    try {
      setInterviewState(prev => ({ ...prev, status: 'Creating interview session...' }));
      
      const response = await fetch('/api/interviews/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          jobId,
          jobTitle: job.title,
          company: job.company,
          requiredSkills: job.skillsRequired,
          experienceLevel: job.experienceLevel,
          jobDescription: job.description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const { session } = await response.json();
      setInterviewSession(session);
      setInterviewState(prev => ({ 
        ...prev, 
        status: 'Ready to start interview',
        currentPhase: 'intro'
      }));
      
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create interview session. Please try again.');
    }
  };

  const handleStartInterview = async () => {
    if (!interviewSession) return;

    try {
      setInterviewState(prev => ({ 
        ...prev, 
        isActive: true,
        status: 'Starting interview...',
        currentPhase: 'connecting'
      }));
      
      // Start the AI agent
      await fetch('/api/interviews/start-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: interviewSession.roomName,
          token: interviewSession.agentToken,
          systemPrompt: 'You are a professional AI interviewer.',
          interviewConfig: interviewSession.config
        })
      });
      
    } catch (err) {
      console.error('Failed to start interview:', err);
      // Fall back to demo mode
      startDemoInterview();
    }
  };

  const startDemoInterview = () => {
    // Start demo interview simulation
    setDemoTranscript('AI Interviewer: ' + demoQuestions[0]);
    
    // Simulate asking questions every 30 seconds
    const demoInterval = setInterval(() => {
      setCurrentDemoQuestion(prev => {
        if (prev < demoQuestions.length - 1) {
          const nextQuestion = prev + 1;
          setDemoTranscript(prevTranscript => 
            prevTranscript + '\n\nAI Interviewer: ' + demoQuestions[nextQuestion]
          );
          return nextQuestion;
        } else {
          // End demo interview
          clearInterval(demoInterval);
          setInterviewState(prevState => ({ 
            ...prevState, 
            currentPhase: 'completed',
            status: 'Demo interview completed'
          }));
          return prev;
        }
      });
    }, 30000);
  };

  const handleEndInterview = async () => {
    setInterviewState(prev => ({ 
      ...prev, 
      isActive: false,
      status: 'Interview completed',
      currentPhase: 'completed'
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseDisplay = () => {
    switch (interviewState.currentPhase) {
      case 'connecting': return 'Connecting...';
      case 'intro': return 'Introduction';
      case 'questions': return 'Interview Questions';
      case 'closing': return 'Closing Remarks';
      case 'completed': return 'Completed';
      case 'demo': return 'Demo Mode';
      default: return 'Preparing';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-red-400 mb-4">{error || 'Job not found'}</p>
          <Link href={`/interviews/${jobId}`}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Interview Setup
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href={`/interviews/${jobId}`}>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit Interview
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">{job.title}</h1>
              <p className="text-sm text-gray-400">{job.company}</p>
            </div>
          </div>
          
          {/* Interview Status */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              {interviewState.isActive && (
                <Circle className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />
              )}
              <span className="text-sm font-mono">
                {formatTime(interviewState.duration)}
              </span>
            </div>
            <Badge variant={isConnected || interviewState.isDemoMode ? "default" : "secondary"}>
              {getPhaseDisplay()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Connection Error Warning */}
      {connectionError && (
        <div className="bg-yellow-900/50 border-b border-yellow-700 p-3">
          <div className="flex items-center justify-center space-x-2 text-yellow-200">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{connectionError}</span>
          </div>
        </div>
      )}

      {/* Main Interview Area */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Video Area */}
        <div className="flex-1 relative bg-black">
          {/* User Video */}
          {interviewSession && (
            <LiveKitRoom 
              token={interviewSession.participantToken}
              serverUrl={interviewSession.wsUrl}
              connect={interviewState.isActive}
              audio={isAudioEnabled}
              video={isVideoEnabled}
              onConnected={() => {
                setInterviewState(prev => ({ 
                  ...prev, 
                  status: 'Interview in progress',
                  currentPhase: 'questions'
                }));
              }}
              onDisconnected={() => {
                setInterviewState(prev => ({ 
                  ...prev, 
                  isActive: false,
                  status: 'Disconnected',
                  currentPhase: 'completed'
                }));
              }}
              className="w-full h-full"
            >
              <div className="w-full h-full">
                <VideoTrack 
                  className="w-full h-full object-cover"
                />
                <RoomAudioRenderer />
              </div>
            </LiveKitRoom>
          )}
          
          {/* Fallback video element for before connection or demo mode */}
          {!interviewSession && (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">
                  {interviewState.isDemoMode ? 'Demo Mode - No Camera Required' : 'Camera will appear here'}
                </p>
              </div>
            </div>
          )}
          
          {/* Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 bg-gray-800/80 backdrop-blur-sm rounded-full px-6 py-3">
              <Button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                variant={isAudioEnabled ? "default" : "destructive"}
                size="sm"
                className="rounded-full"
              >
                {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                variant={isVideoEnabled ? "default" : "destructive"}
                size="sm"
                className="rounded-full"
              >
                {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              
              {!interviewState.isActive ? (
                <Button
                  onClick={handleStartInterview}
                  disabled={!interviewSession}
                  className="bg-green-600 hover:bg-green-700 rounded-full px-6"
                >
                  <Circle className="h-4 w-4 mr-2" />
                  Start Interview
                </Button>
              ) : (
                <Button
                  onClick={handleEndInterview}
                  variant="destructive"
                  className="rounded-full px-6"
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Interview
                </Button>
              )}
            </div>
          </div>
          
          {/* AI Speaking Indicator */}
          {(isConnected || interviewState.isDemoMode) && (
            <div className="absolute top-6 left-6">
              <div className="flex items-center space-x-2 bg-blue-600/80 backdrop-blur-sm rounded-full px-4 py-2">
                <Volume2 className="h-4 w-4" />
                <span className="text-sm">
                  {interviewState.isDemoMode ? 'AI Interviewer (Demo)' : 'AI Interviewer Active'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Interview Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* AI Interviewer */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium">AI Interviewer</h3>
                <p className="text-xs text-gray-400">{job.title} Interview</p>
              </div>
              {(isConnected || interviewState.isDemoMode) && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-300">{interviewState.status}</p>
          </div>

          {/* Live Transcript */}
          <div className="flex-1 p-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Live Transcript</h4>
            <div className="bg-gray-700/50 rounded-lg p-4 h-64 overflow-y-auto">
              {(transcript || demoTranscript) ? (
                <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
                  {transcript || demoTranscript}
                </p>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Transcript will appear here during the interview...
                </p>
              )}
            </div>
          </div>

          {/* Interview Progress */}
          <div className="p-6 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Progress</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Duration</span>
                <span className="font-mono">{formatTime(interviewState.duration)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Phase</span>
                <span>{getPhaseDisplay()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Connection</span>
                <span className={isConnected || interviewState.isDemoMode ? 'text-green-400' : 'text-yellow-400'}>
                  {interviewState.isDemoMode ? 'Demo Mode' : isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 