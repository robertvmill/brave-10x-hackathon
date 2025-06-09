'use client'

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronsUpDown,
  FileClock,
  LayoutDashboard,
  LogOut,
  Settings,
  UserCircle,
  UserSearch,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Eye,
  RefreshCw,
  FileCheck,
  Zap,
  Brain
} from "lucide-react";

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

function CandidateSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }
  
  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 z-40 h-full shrink-0 border-r fixed"
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={`relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-background dark:bg-background transition-all`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0 border-b p-2">
              <div className="mt-[1.5px] flex w-full">
                <div className="w-full flex items-center gap-2 px-2">
                  <Avatar className="rounded size-4">
                    <AvatarFallback className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs">H</AvatarFallback>
                  </Avatar>
                  <motion.li
                    variants={variants}
                    className="flex w-fit items-center gap-2"
                  >
                    {!isCollapsed && (
                      <p className="text-sm font-medium bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                        HireHub
                      </p>
                    )}
                  </motion.li>
                </div>
              </div>
            </div>

            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    <Link
                      href="/jobs"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("jobs") &&
                          "bg-muted text-blue-600"
                      )}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Explore</p>
                        )}
                      </motion.li>
                    </Link>
                    <Link
                      href="/home"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("home") &&
                          "bg-muted text-blue-600"
                      )}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <div className="flex items-center gap-2">
                            <p className="ml-2 text-sm font-medium">Home</p>
                          </div>
                        )}
                      </motion.li>
                    </Link>
                    <Link
                      href="/resume"
                      className={cn(
                        "flex h-8 flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("resume") && "bg-muted text-blue-600"
                      )}
                    >
                      <UserCircle className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Resume</p>
                        )}
                      </motion.li>
                    </Link>
                    <Link
                      href="/interviews"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("interviews") &&
                          "bg-muted text-blue-600"
                      )}
                    >
                      <FileClock className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">
                            Interviews
                          </p>
                        )}
                      </motion.li>
                    </Link>
                    <Link
                      href="/payments"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("payments") &&
                          "bg-muted text-blue-600"
                      )}
                    >
                      <UserSearch className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">
                            Payments
                          </p>
                        )}
                      </motion.li>
                    </Link>
                  </div>
                </ScrollArea>
              </div>
              <div className="flex flex-col p-2">
                <Link
                  href="/settings"
                  className="mt-auto flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <motion.li variants={variants}>
                    {!isCollapsed && (
                      <p className="ml-2 text-sm font-medium"> Settings</p>
                    )}
                  </motion.li>
                </Link>
                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="w-full">
                      <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary">
                        <Avatar className="size-4">
                          <AvatarFallback>
                            {user?.fullName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <motion.li
                          variants={variants}
                          className="flex w-full items-center gap-2"
                        >
                          {!isCollapsed && (
                            <>
                              <p className="text-sm font-medium">{user?.fullName || 'User'}</p>
                              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />
                            </>
                          )}
                        </motion.li>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5}>
                      <div className="flex flex-row items-center gap-2 p-2">
                        <Avatar className="size-6">
                          <AvatarFallback>
                            {user?.fullName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium">
                            {user?.fullName || 'User'}
                          </span>
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {user?.email || 'user@example.com'}
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        asChild
                        className="flex items-center gap-2"
                      >
                        <Link href="/profile">
                          <UserCircle className="h-4 w-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                      >
                        <LogOut className="h-4 w-4" /> {isSigningOut ? 'Signing out...' : 'Sign out'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}

interface ParsedResume {
  id: string;
  filename: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'failed';
  extractedData?: {
    name?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experience?: string;
    education?: string;
    jobTitle?: string;
    location?: string;
    summary?: string;
  };
  analysisScore?: number;
}

export default function ResumePage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedResumes, setUploadedResumes] = useState<ParsedResume[]>([
    {
      id: '1',
      filename: 'john_doe_resume.pdf',
      uploadDate: '2 hours ago',
      status: 'completed',
      extractedData: {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
        experience: '5 years in Frontend Development',
        education: 'B.S. Computer Science, Stanford University'
      },
      analysisScore: 85
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, Word document, or text file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    // Start upload process
    setIsProcessing(true);
    setUploadProgress(10);

    try {
      // Create FormData for our open source API
      const formData = new FormData();
      formData.append('file', file);
      
      setUploadProgress(30);

      // Call our open source resume parsing API
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData
      });

      setUploadProgress(60);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const result = await response.json();
      setUploadProgress(80);

      // Extract parsed data from our API response
      const { parsedData, atsScore } = result.data;
      const extractedData = {
        name: parsedData.name || 'Name not found',
        email: parsedData.email || 'Email not found',
        phone: parsedData.phone || 'Phone not found',
        skills: parsedData.skills || [],
        experience: parsedData.experience || 'Experience not found',
        education: parsedData.education || 'Education not found',
        jobTitle: parsedData.jobTitle || 'Job title not found',
        location: parsedData.location || 'Location not found',
        summary: parsedData.summary || 'Summary not found'
      };

      setUploadProgress(100);

      const newResume: ParsedResume = {
        id: Date.now().toString(),
        filename: file.name,
        uploadDate: 'Just now',
        status: 'completed',
        extractedData,
        analysisScore: atsScore
      };

      setUploadedResumes(prev => [newResume, ...prev]);
      
      console.log('Open source parsing result:', result);
      
    } catch (error) {
      console.error('Resume parsing error:', error);
      
      // Create failed resume entry
      const newResume: ParsedResume = {
        id: Date.now().toString(),
        filename: file.name,
        uploadDate: 'Just now',
        status: 'failed'
      };

      setUploadedResumes(prev => [newResume, ...prev]);
      
      alert(`Resume parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const getStatusIcon = (status: ParsedResume['status']) => {
    switch (status) {
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: ParsedResume['status']) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Failed</Badge>;
    }
  };

  return (
    <div className="flex h-screen w-screen flex-row">
      <CandidateSidebar />
      <main className="flex h-screen grow flex-col overflow-auto pl-[3.05rem]">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Resume Management
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload and analyze your resume with AI-powered parsing
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI-Powered Resume Scanner
                  </CardTitle>
                  <CardDescription>
                    Upload your resume and get instant AI analysis with skill extraction, formatting suggestions, and ATS optimization tips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                      dragActive 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      onChange={handleChange}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    
                    {isProcessing ? (
                      <div className="space-y-4">
                        <RefreshCw className="h-12 w-12 text-primary mx-auto animate-spin" />
                        <div>
                          <p className="text-lg font-medium text-foreground mb-2">
                            Processing your resume...
                          </p>
                          <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                          <p className="text-sm text-muted-foreground mt-2">
                            {uploadProgress < 30 ? 'Uploading...' : 
                             uploadProgress < 60 ? 'Analyzing content...' : 
                             uploadProgress < 90 ? 'Extracting data...' : 
                             'Finalizing...'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div>
                          <h3 className="text-lg font-medium text-foreground mb-2">
                            Drop your resume here or click to upload
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Supports PDF, Word documents, and text files up to 5MB
                          </p>
                          <Button 
                            onClick={() => document.getElementById('resume-upload')?.click()}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          We use advanced AI to extract skills, experience, education, and provide ATS optimization suggestions
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Zap className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                      <h4 className="font-medium text-foreground">Instant Analysis</h4>
                      <p className="text-xs text-muted-foreground">AI-powered parsing in seconds</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <FileCheck className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <h4 className="font-medium text-foreground">ATS Optimization</h4>
                      <p className="text-xs text-muted-foreground">Ensure compatibility with ATS systems</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Brain className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-medium text-foreground">Skill Extraction</h4>
                      <p className="text-xs text-muted-foreground">Automatically identify your skills</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats and Tips */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parsing Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Uploads</span>
                    <span className="font-medium text-foreground">{uploadedResumes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Successfully Parsed</span>
                    <span className="font-medium text-foreground">
                      {uploadedResumes.filter(r => r.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className="font-medium text-foreground">
                      {uploadedResumes.filter(r => r.analysisScore).length > 0 
                        ? Math.round(uploadedResumes.filter(r => r.analysisScore).reduce((sum, r) => sum + (r.analysisScore || 0), 0) / uploadedResumes.filter(r => r.analysisScore).length)
                        : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tips for Better Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Use standard section headings (Experience, Education, Skills)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Save in PDF format for best compatibility</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Include relevant keywords from job descriptions</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Avoid complex layouts and graphics</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Uploaded Resumes */}
          {uploadedResumes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Uploaded Resumes
              </h2>
              <div className="space-y-4">
                {uploadedResumes.map((resume) => (
                  <Card key={resume.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground mb-1">
                              {resume.filename}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <span>Uploaded {resume.uploadDate}</span>
                              {resume.analysisScore && (
                                <span>ATS Score: {resume.analysisScore}%</span>
                              )}
                            </div>
                            {resume.extractedData && (
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline">{resume.extractedData.name}</Badge>
                                  <Badge variant="outline">{resume.extractedData.email}</Badge>
                                  <Badge variant="outline">{resume.extractedData.experience}</Badge>
                                </div>
                                {resume.extractedData.skills && (
                                  <div className="flex flex-wrap gap-1">
                                    {resume.extractedData.skills.slice(0, 5).map((skill, index) => (
                                      <Badge key={index} className="bg-primary/10 text-primary hover:bg-primary/20">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {resume.extractedData.skills.length > 5 && (
                                      <Badge variant="outline">+{resume.extractedData.skills.length - 5} more</Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(resume.status)}
                          {getStatusBadge(resume.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download Report
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <X className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 