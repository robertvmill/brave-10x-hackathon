'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Mic, 
  MicOff,
  Camera,
  CameraOff,
  Play,
  Pause,
  Clock,
  CheckCircle,
  User,
  Brain,
  AlertCircle
} from 'lucide-react';

// Custom LiveKit hook
import { useLiveKit } from '@/components/LiveKitProvider';

interface JobDetails {
  id: string;
  title: string;
  company: { name: string };
  jobType: string;
  location: string;
  description: string;
  requirements?: string;
  skillsRequired?: string[];
}

interface InterviewStepProps {
  applicationId: string;
  jobDetails: JobDetails;
  resumeData: any;
  onComplete: (data: any) => void;
}

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  expected_duration: number;
}

interface InterviewProgress {
  current_question: number;
  total_questions: number;
  progress_percentage: number;
  completed: boolean;
}

export default function InterviewStep({ applicationId, jobDetails, resumeData, onComplete }: InterviewStepProps) {
  const [interviewState, setInterviewState] = useState<'ready' | 'connecting' | 'connected' | 'interview_active' | 'completed' | 'error'>('ready');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [progress, setProgress] = useState<InterviewProgress>({ current_question: 1, total_questions: 6, progress_percentage: 0, completed: false });
  const [transcript, setTranscript] = useState<any[]>([]);
  const [agentState, setAgentState] = useState<'ready' | 'listening' | 'thinking' | 'speaking'>('ready');

  // LiveKit connection
  const { room, isConnected, isConnecting, connect, disconnect, error: liveKitError } = useLiveKit();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (interviewState === 'interview_active') {
      timer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [interviewState]);

  // Update error state from LiveKit
  useEffect(() => {
    if (liveKitError) {
      setError(liveKitError);
      setInterviewState('error');
    }
  }, [liveKitError]);

  // Update connection state
  useEffect(() => {
    if (isConnecting) {
      setInterviewState('connecting');
    } else if (isConnected) {
      setInterviewState('connected');
    }
  }, [isConnecting, isConnected]);

  const initializeInterview = async () => {
    try {
      setError(null);

      // Create LiveKit room and get access token for interview
      const response = await fetch('/api/interviews/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          jobData: jobDetails,
          resumeData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create interview room');
      }

      const { token, wsUrl } = await response.json();
      
      // Connect to LiveKit room
      await connect(token, wsUrl);

    } catch (err) {
      console.error('Interview initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start interview');
      setInterviewState('error');
    }
  };

  const startInterview = async () => {
    if (!room) return;

    try {
      // Call the start_interview RPC method on the agent
      const result = await room.localParticipant.performRpc({
        destinationIdentity: 'interview-agent',
        method: 'start_interview',
        payload: ''
      });

      const response = JSON.parse(result);
      console.log('Interview started:', response);
      
      setCurrentQuestion(response.question);
      setInterviewState('interview_active');
      setAgentState('listening');
      
    } catch (err) {
      console.error('Error starting interview:', err);
      setError('Failed to start interview');
      setInterviewState('error');
    }
  };

  const nextQuestion = async () => {
    if (!room) return;

    try {
      setAgentState('thinking');
      
      const result = await room.localParticipant.performRpc({
        destinationIdentity: 'interview-agent',
        method: 'next_question',
        payload: ''
      });

      const response = JSON.parse(result);
      console.log('Next question:', response);
      
      if (response.status === 'completed') {
        setInterviewState('completed');
        setTranscript(response.transcript);
        await endInterview();
      } else {
        setCurrentQuestion(response.question);
        setAgentState('listening');
        // Update progress
        setProgress(prev => ({
          ...prev,
          current_question: prev.current_question + 1,
          progress_percentage: ((prev.current_question) / prev.total_questions) * 100
        }));
      }
      
    } catch (err) {
      console.error('Error getting next question:', err);
      setAgentState('ready');
    }
  };

  const endInterview = async () => {
    if (!room) return;

    try {
      const result = await room.localParticipant.performRpc({
        destinationIdentity: 'interview-agent',
        method: 'end_interview',
        payload: ''
      });

      const response = JSON.parse(result);
      console.log('Interview ended:', response);
      
      setTranscript(response.transcript);
      setProgress(response.progress);
      setInterviewState('completed');
      
      // Complete the step and pass transcript data
      onComplete({
        status: 'interview_completed',
        interviewCompleted: true,
        duration,
        transcript: response.transcript,
        progress: response.progress
      });
      
    } catch (err) {
      console.error('Error ending interview:', err);
    } finally {
      // Disconnect from room
      await disconnect();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateDisplay = () => {
    switch (agentState) {
      case 'listening': return { text: 'Listening...', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' };
      case 'thinking': return { text: 'Processing...', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' };
      case 'speaking': return { text: 'AI Speaking', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
      default: return { text: 'Ready', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' };
    }
  };

  // Error state
  if (interviewState === 'error') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Interview Error
          </CardTitle>
          <CardDescription>
            We encountered an issue starting your interview. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={initializeInterview} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => onComplete({ status: 'interview_completed', interviewCompleted: false })} variant="secondary">
              Skip Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Completed state
  if (interviewState === 'completed') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            Interview Completed Successfully!
          </CardTitle>
          <CardDescription>
            Your interview has been processed and analyzed. We'll now generate personalized job recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">{formatDuration(duration)}</div>
              <div className="text-sm text-muted-foreground">Interview Duration</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{progress.total_questions}</div>
              <div className="text-sm text-muted-foreground">Questions Answered</div>
            </div>
          </div>
          
          {transcript.length > 0 && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Interview Summary</h4>
              <p className="text-sm text-muted-foreground">
                {transcript.length} responses recorded and analyzed for job matching.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Active interview state
  if (interviewState === 'interview_active') {
    const stateDisplay = getStateDisplay();
    
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-red-500" />
            AI Interview in Progress
          </CardTitle>
          <CardDescription>
            Answer the questions naturally. The AI will analyze your responses and communication style.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Interview Interface */}
          <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative">
            <div className="text-white text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <p className="text-lg font-medium">AI Interviewer</p>
              
              {/* Simple audio indicator */}
              <div className="mt-4 flex justify-center space-x-1">
                {agentState === 'listening' && (
                  <>
                    <div className="w-2 h-8 bg-blue-500 rounded animate-pulse"></div>
                    <div className="w-2 h-6 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-10 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-4 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-2 h-8 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Recording</span>
              </div>
            </div>
            
            {/* Timer */}
            <div className="absolute top-4 right-4 bg-black/50 px-2 py-1 rounded text-white text-sm">
              {formatDuration(duration)}
            </div>
          </div>

          {/* Current Question */}
          {currentQuestion && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">Question {progress.current_question} of {progress.total_questions}</Badge>
                <Badge className={stateDisplay.color}>
                  {stateDisplay.text}
                </Badge>
              </div>
              <p className="text-foreground font-medium">
                {currentQuestion.question}
              </p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{width: `${progress.progress_percentage}%`}}
            ></div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="sm" onClick={nextQuestion} disabled={agentState === 'thinking'}>
              {agentState === 'thinking' ? 'Processing...' : 'Next Question'}
            </Button>
            <Button 
              onClick={endInterview}
              variant="destructive" 
              size="sm"
            >
              End Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ready/Connecting states
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          AI-Powered Interview
        </CardTitle>
        <CardDescription>
          Take a short interview with our AI to help us understand your skills and personality better.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Interview Preview */}
        <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">What to Expect</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm">5-10 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm">6 personalized questions</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm">AI analysis of responses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm">Instant job matching</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Questions Preview */}
        <div>
          <h4 className="font-medium mb-3">Sample Questions Based on Your Resume:</h4>
          <div className="space-y-2">
            <div className="bg-muted p-3 rounded text-sm">
              <span className="font-medium text-primary">Q1:</span> Tell me about your experience with {resumeData?.skills?.[0] || 'your main technical skills'}.
            </div>
            <div className="bg-muted p-3 rounded text-sm">
              <span className="font-medium text-primary">Q2:</span> How do you see yourself fitting into the {jobDetails.title} role?
            </div>
            <div className="bg-muted p-3 rounded text-sm">
              <span className="font-medium text-primary">Q3:</span> What interests you most about working at {jobDetails.company.name}?
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={interviewState === 'ready' ? initializeInterview : startInterview}
            disabled={interviewState === 'connecting'}
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
          >
            {interviewState === 'connecting' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : interviewState === 'connected' ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Interview
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Initialize Interview
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 