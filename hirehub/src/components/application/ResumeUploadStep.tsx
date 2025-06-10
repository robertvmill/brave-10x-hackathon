'use client'

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  X,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react';

interface JobDetails {
  id: string;
  title: string;
  company: { name: string };
  jobType: string;
  location: string;
  description: string;
}

interface ResumeUploadStepProps {
  applicationId: string;
  jobDetails: JobDetails;
  onComplete: (data: any) => void;
}

interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  jobTitle?: string;
  location?: string;
  summary?: string;
}

export default function ResumeUploadStep({ applicationId, jobDetails, onComplete }: ResumeUploadStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, []);

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    setError(null);
    setIsProcessing(true);
    setUploadProgress(10);

    try {
      // First, parse the resume
      const formData = new FormData();
      formData.append('file', file);
      
      setUploadProgress(30);

      const parseResponse = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData
      });

      setUploadProgress(60);

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        throw new Error(errorData.error || 'Failed to parse resume');
      }

      const parseResult = await parseResponse.json();
      const { parsedData, atsScore } = parseResult.data;
      
      setParsedData(parsedData);
      setUploadProgress(80);

      // Update application with resume data
      const updateResponse = await fetch(`/api/applications/${applicationId}/resume`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData: parsedData,
          atsScore,
          filename: file.name
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to save resume data');
      }

      setUploadProgress(100);
      setResumeUrl(file.name); // In real app, this would be the uploaded file URL

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process resume');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleContinue = () => {
    if (parsedData) {
      onComplete({
        status: 'resume_uploaded',
        resumeData: parsedData,
        resumeUrl
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Your Resume
        </CardTitle>
        <CardDescription>
          Upload your resume to get personalized interview questions for the {jobDetails.title} position
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!parsedData ? (
          <>
            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                ${isProcessing ? 'pointer-events-none opacity-50' : 'hover:border-primary/50'}
              `}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleChange}
                disabled={isProcessing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Drop your resume here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports PDF, Word documents, and text files (max 10MB)
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <Button disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Choose File'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processing your resume...</span>
                  <span className="text-primary">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Resume Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Resume Processed Successfully</h3>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Parsed
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {parsedData.name && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{parsedData.name}</span>
                      </div>
                    )}
                    {parsedData.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{parsedData.email}</span>
                      </div>
                    )}
                    {parsedData.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{parsedData.phone}</span>
                      </div>
                    )}
                    {parsedData.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{parsedData.location}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Professional Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Professional Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {parsedData.jobTitle && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Title: </span>
                        <span>{parsedData.jobTitle}</span>
                      </div>
                    )}
                    {parsedData.experience && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Experience: </span>
                        <span>{parsedData.experience}</span>
                      </div>
                    )}
                    {parsedData.education && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Education: </span>
                        <span>{parsedData.education}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Skills */}
              {parsedData.skills && parsedData.skills.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.skills.slice(0, 10).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {parsedData.skills.length > 10 && (
                        <Badge variant="outline" className="text-xs">
                          +{parsedData.skills.length - 10} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary */}
              {parsedData.summary && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Professional Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{parsedData.summary}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Continue Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleContinue} className="bg-primary hover:bg-primary/90">
                Continue to Interview
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 