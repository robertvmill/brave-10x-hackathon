'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  MapPin,
  DollarSign,
  Clock,
  Star,
  ExternalLink,
  CheckCircle,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface JobDetails {
  id: string;
  title: string;
  company: { name: string };
  jobType: string;
  location: string;
  description: string;
}

interface RecommendationsStepProps {
  applicationId: string;
  jobDetails: JobDetails;
  onComplete: () => void;
}

interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salaryRange?: string;
  matchScore: number;
  matchReasons: string[];
  skillsMatch: string[];
  description: string;
  remote: boolean;
}

const mockRecommendations: JobRecommendation[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechFlow Solutions',
    location: 'San Francisco, CA',
    jobType: 'Full-time',
    salaryRange: '$120k - $150k',
    matchScore: 94,
    matchReasons: [
      'Strong React and TypeScript experience',
      'Perfect experience level match',
      'Skills align with job requirements'
    ],
    skillsMatch: ['React', 'TypeScript', 'Node.js', 'AWS'],
    description: 'Build scalable web applications using modern React and TypeScript.',
    remote: true
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'Innovation Labs',
    location: 'Austin, TX',
    jobType: 'Full-time',
    salaryRange: '$110k - $140k',
    matchScore: 89,
    matchReasons: [
      'Full stack expertise matches requirements',
      'Experience with modern frameworks',
      'Strong problem-solving demonstrated'
    ],
    skillsMatch: ['React', 'Python', 'PostgreSQL', 'Docker'],
    description: 'Work on end-to-end features for our AI-powered platform.',
    remote: true
  },
  {
    id: '3',
    title: 'Lead Product Engineer',
    company: 'StartupX',
    location: 'Remote',
    jobType: 'Full-time',
    salaryRange: '$130k - $160k',
    matchScore: 86,
    matchReasons: [
      'Leadership potential identified',
      'Product mindset evident in responses',
      'Technical depth aligns with needs'
    ],
    skillsMatch: ['JavaScript', 'Product Strategy', 'Team Leadership'],
    description: 'Lead engineering initiatives and mentor junior developers.',
    remote: true
  }
];

export default function RecommendationsStep({ applicationId, jobDetails, onComplete }: RecommendationsStepProps) {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    generateRecommendations();
  }, []);

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      
      // Simulate API call to generate recommendations
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call an API
      // const response = await fetch(`/api/recommendations/generate`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ applicationId })
      // });
      
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      // In real implementation, save to database
      setSavedJobs(prev => [...prev, jobId]);
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleApplyToRecommended = (jobId: string) => {
    // Navigate to application for recommended job
    window.open(`/apply/${jobId}`, '_blank');
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
    if (score >= 80) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 animate-pulse" />
            Generating Your Personalized Recommendations
          </CardTitle>
          <CardDescription>
            Our AI is analyzing your interview responses to find the perfect job matches...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">AI Analysis in Progress</p>
              <p className="text-sm text-muted-foreground">
                Matching your skills and interview responses with available positions...
              </p>
              <div className="mt-4">
                <div className="animate-pulse flex space-x-1">
                  <div className="rounded-full bg-primary h-2 w-2"></div>
                  <div className="rounded-full bg-primary h-2 w-2 animation-delay-150"></div>
                  <div className="rounded-full bg-primary h-2 w-2 animation-delay-300"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Your Personalized Job Recommendations
        </CardTitle>
        <CardDescription>
          Based on your interview responses and resume, here are jobs that match your profile perfectly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{recommendations.length}</div>
            <div className="text-sm text-muted-foreground">Perfect Matches</div>
          </div>
          <div className="bg-emerald-500/10 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {Math.round(recommendations.reduce((acc, rec) => acc + rec.matchScore, 0) / recommendations.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Match Score</div>
          </div>
          <div className="bg-blue-500/10 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {recommendations.filter(r => r.remote).length}
            </div>
            <div className="text-sm text-muted-foreground">Remote Options</div>
          </div>
        </div>

        {/* Job Recommendations */}
        <div className="space-y-4">
          {recommendations.map((job, index) => (
            <Card key={job.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                      {job.salaryRange && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.salaryRange}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getMatchColor(job.matchScore)} font-semibold`}>
                      {job.matchScore}% Match
                    </Badge>
                    {index === 0 && (
                      <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 ml-2">
                        <Star className="h-3 w-3 mr-1" />
                        Top Pick
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{job.description}</p>
                
                {/* Skills Match */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Matching Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsMatch.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Match Reasons */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Why This Matches You:</h4>
                  <div className="space-y-1">
                    {job.matchReasons.map((reason, reasonIndex) => (
                      <div key={reasonIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    onClick={() => handleApplyToRecommended(job.id)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Apply Now
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSaveJob(job.id)}
                    disabled={savedJobs.includes(job.id)}
                  >
                    {savedJobs.includes(job.id) ? 'Saved' : 'Save for Later'}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Complete Application */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-lg text-center">
          <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Application Complete!
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your application for {jobDetails.title} at {jobDetails.company.name} has been submitted successfully. 
            We've also found {recommendations.length} additional opportunities that match your profile.
          </p>
          <Button onClick={onComplete} className="bg-primary hover:bg-primary/90">
            Return to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 