'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Video, 
  CheckCircle, 
  ArrowRight,
  Briefcase,
  Clock,
  User
} from 'lucide-react';

// Components for each step
import ResumeUploadStep from '@/components/application/ResumeUploadStep';
import InterviewStep from '@/components/application/InterviewStep';
import RecommendationsStep from '@/components/application/RecommendationsStep';
import { LiveKitProvider } from '@/components/LiveKitProvider';

type ApplicationStatus = 'draft' | 'resume_uploaded' | 'interview_scheduled' | 'interview_completed' | 'submitted';

interface JobDetails {
  id: string;
  title: string;
  company: { name: string };
  jobType: string;
  location: string;
  description: string;
}

interface ApplicationData {
  id: string;
  status: ApplicationStatus;
  resumeUrl?: string;
  resumeData?: any;
}

const STEPS = [
  { id: 1, name: 'Upload Resume', icon: Upload, status: 'draft' as ApplicationStatus },
  { id: 2, name: 'AI Interview', icon: Video, status: 'resume_uploaded' as ApplicationStatus },
  { id: 3, name: 'Job Recommendations', icon: Briefcase, status: 'interview_completed' as ApplicationStatus }
];

function ApplicationFlowContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jobId = params.jobId as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !jobId) return;
    
    initializeApplication();
  }, [user, jobId]);

  const initializeApplication = async () => {
    try {
      setLoading(true);
      
      // Get job details
      const jobResponse = await fetch(`/api/jobs/${jobId}`);
      if (!jobResponse.ok) {
        throw new Error('Job not found');
      }
      const job = await jobResponse.json();
      setJobDetails(job);

      // Start or get existing application
      const appResponse = await fetch('/api/applications/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: user.id,
          opportunityId: jobId
        })
      });

      if (!appResponse.ok) {
        throw new Error('Failed to start application');
      }

      const appData = await appResponse.json();
      setApplicationData(appData);

      // Set current step based on application status
      const stepMap = {
        'draft': 1,
        'resume_uploaded': 2,
        'interview_scheduled': 2,
        'interview_completed': 3,
        'submitted': 3
      };
      setCurrentStep(stepMap[appData.status] || 1);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize application');
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = (stepNumber: number, data?: any) => {
    if (data && applicationData) {
      setApplicationData({ ...applicationData, ...data });
    }
    
    if (stepNumber < STEPS.length) {
      setCurrentStep(stepNumber + 1);
    }
  };

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const getProgressPercentage = () => {
    return ((currentStep - 1) / (STEPS.length - 1)) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Apply to {jobDetails?.title}</h1>
              <p className="text-muted-foreground">at {jobDetails?.company.name}</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {jobDetails?.jobType}
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const status = getStepStatus(step.id);
              const IconComponent = step.icon;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${status === 'completed' ? 'bg-primary border-primary text-primary-foreground' : 
                      status === 'current' ? 'border-primary text-primary' : 
                      'border-muted-foreground text-muted-foreground'}
                  `}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <IconComponent className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      status === 'current' ? 'text-primary' : 
                      status === 'completed' ? 'text-foreground' : 
                      'text-muted-foreground'
                    }`}>
                      {step.name}
                    </p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <ArrowRight className="h-4 w-4 mx-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
          
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 1 && applicationData && (
            <ResumeUploadStep 
              applicationId={applicationData.id}
              jobDetails={jobDetails!}
              onComplete={(data) => handleStepComplete(1, data)}
            />
          )}
          
          {currentStep === 2 && applicationData && (
            <InterviewStep 
              applicationId={applicationData.id}
              jobDetails={jobDetails!}
              resumeData={applicationData.resumeData}
              onComplete={(data) => handleStepComplete(2, data)}
            />
          )}
          
          {currentStep === 3 && applicationData && (
            <RecommendationsStep 
              applicationId={applicationData.id}
              jobDetails={jobDetails!}
              onComplete={() => router.push('/dashboard/candidate')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ApplicationFlow() {
  return (
    <LiveKitProvider>
      <ApplicationFlowContent />
    </LiveKitProvider>
  );
} 