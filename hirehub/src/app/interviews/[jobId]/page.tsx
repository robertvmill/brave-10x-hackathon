'use client'

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Video,
  Clock,
  CheckCircle,
  Mic,
  Camera,
  Monitor,
  Loader2,
  AlertCircle,
  Play
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  jobType: string;
  experienceLevel: string | null;
}

export default function AIInterviewPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isStarting, setIsStarting] = useState(false);

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

  const handleStartInterview = async () => {
    setIsStarting(true);
    // Redirect to live interview page
    window.location.href = `/interviews/${jobId}/live`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-background to-cyan-50 dark:from-muted dark:via-background dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-background to-cyan-50 dark:from-muted dark:via-background dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Job not found'}</p>
          <Link href="/jobs">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href={`/jobs/${jobId}`}>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Job Details
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Video className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              AI Interview
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              You're about to start an AI-powered interview for
            </p>
            <div className="bg-card border border-border rounded-lg p-6 inline-block">
              <h2 className="text-2xl font-semibold text-foreground mb-2">{job.title}</h2>
              <p className="text-lg text-muted-foreground">{job.company}</p>
            </div>
          </motion.div>

          {/* Interview Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-8"
          >
            <h3 className="text-2xl font-semibold mb-6">What to Expect</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h4 className="font-medium mb-2">30 Minutes</h4>
                <p className="text-sm text-muted-foreground">
                  Interactive AI interview session
                </p>
              </div>
              <div className="text-center">
                <Video className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Video Based</h4>
                <p className="text-sm text-muted-foreground">
                  AI will analyze your responses
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Instant Feedback</h4>
                <p className="text-sm text-muted-foreground">
                  Get results immediately after
                </p>
              </div>
            </div>
          </motion.div>

          {/* System Check */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-8"
          >
            <h3 className="text-xl font-semibold mb-6">System Check</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Camera Access</span>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <Mic className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Microphone Access</span>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Stable Internet Connection</span>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-lg p-8"
          >
            <h3 className="text-xl font-semibold mb-6">Interview Guidelines</h3>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p>Find a quiet, well-lit space with minimal distractions</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p>Look directly at the camera when speaking</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p>Speak clearly and at a normal pace</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p>Take your time to think before answering questions</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <p>Be authentic and showcase your personality</p>
              </div>
            </div>
          </motion.div>

          {/* Ready Check */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-lg p-8 text-center"
          >
            <h3 className="text-2xl font-semibold mb-4">Ready to Start?</h3>
            <p className="text-muted-foreground mb-8">
              Make sure you're in a comfortable environment and ready to showcase your best self.
            </p>
            
            <Button
              onClick={handleStartInterview}
              disabled={isStarting}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white text-lg px-8 py-4 h-auto"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Starting Interview...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-3" />
                  Start AI Interview
                </>
              )}
            </Button>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>This interview will be recorded for evaluation purposes</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 