'use client'

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Users,
  Building2,
  Globe,
  Upload,
  FileText,
  BookmarkPlus,
  Bookmark,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useRouter } from 'next/navigation'

// Job interface (should match the one from the main jobs page)
interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  jobType: string;
  experienceLevel: string | null;
  postedTime: string;
  isActive: boolean;
  featured: boolean;
  description: string | null;
  requirements: string | null;
  skillsRequired: string[];
  skillsPreferred?: string[];
  remoteAllowed: boolean;
  companyInfo: {
    name: string;
    description: string | null;
    website: string | null;
    logoUrl: string | null;
    industry: string | null;
    location: string | null;
  };
  recruiter: {
    name: string | null;
    title: string | null;
  };
}

export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  // Unwrap the params Promise using React.use()
  const { jobId } = use(params)
  
  const { user } = useAuth()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [savedJobs, setSavedJobs] = useState<string[]>([])

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/jobs/${jobId}`)
        if (!response.ok) {
          throw new Error('Job not found')
        }
        const jobData = await response.json()
        setJob(jobData)
      } catch (err) {
        setError('Failed to load job details. Please try again later.')
        console.error('Error fetching job:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [jobId])

  const handleApplyToJob = async () => {
    if (!job) return
    
    // Navigate to our new application flow
    router.push(`/apply/${job.id}`)
  }

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === 'application/pdf' || file.type.includes('word'))) {
      setResumeFile(file)
    } else {
      alert('Please upload a PDF or Word document')
    }
  }

  const handleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }

  const formatSalary = (min: number | null, max: number | null, jobType?: string) => {
    if (!min || !max) return 'Salary not specified'
    
    const isHourly = jobType === 'Contractor' || jobType === 'Freelance'
    const suffix = isHourly ? '/hour' : ' / year'
    
    if (isHourly) {
      return `$${min} - $${max}${suffix}`
    }
    
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `${Math.round(num / 1000)}k`
      }
      return num.toString()
    }
    
    return `$${formatNumber(min)} - $${formatNumber(max)}${suffix}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Geometric Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-muted/10 blur-3xl"></div>
        <div className="absolute top-1/2 -left-32 w-72 h-72 rounded-full bg-muted/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-muted/5 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/jobs">
            <Button variant="ghost" className="hover:bg-muted/50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card p-6 rounded-2xl border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {job.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        Featured
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {job.experienceLevel}
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center text-muted-foreground text-sm space-x-4">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {job.companyInfo.name}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location || 'Remote'}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {job.postedTime}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSaveJob(job.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {savedJobs.includes(job.id) ? (
                    <Bookmark className="h-5 w-5 fill-current" />
                  ) : (
                    <BookmarkPlus className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-foreground font-medium">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {formatSalary(job.salaryMin, job.salaryMax, job.jobType)}
                  </div>
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "capitalize",
                      job.jobType === 'Full_time' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                      job.jobType === 'Part_time' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                      job.jobType === 'Contractor' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    )}
                  >
                    {job.jobType.replace('_', '-')}
                  </Badge>
                  {job.remoteAllowed && (
                    <Badge variant="outline">
                      Remote OK
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Job Description */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card p-6 rounded-2xl border border-border"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Job Description</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {job.description || 'No description available.'}
                </p>
              </div>
            </motion.div>

            {/* Requirements */}
            {job.requirements && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card p-6 rounded-2xl border border-border"
              >
                <h2 className="text-lg font-semibold text-foreground mb-4">Requirements</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {job.requirements}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Skills */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card p-6 rounded-2xl border border-border"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
              
              {job.skillsPreferred && job.skillsPreferred.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-foreground mb-2">Preferred Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsPreferred.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card p-6 rounded-2xl border border-border"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Apply Now</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ready to apply? Our AI will conduct a personalized interview based on your resume and this job posting.
              </p>
              
              <Button 
                onClick={handleApplyToJob}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-3"
                size="lg"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting Interview...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Apply Now
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                You'll be able to upload your resume in the next step
              </p>
            </motion.div>

            {/* Company Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card p-6 rounded-2xl border border-border"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">About {job.companyInfo.name}</h3>
              
              <div className="space-y-3">
                {job.companyInfo.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {job.companyInfo.description}
                  </p>
                )}
                
                <div className="space-y-2">
                  {job.companyInfo.industry && (
                    <div className="flex items-center text-sm">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Industry:</span>
                      <span className="ml-1 text-foreground">{job.companyInfo.industry}</span>
                    </div>
                  )}
                  
                  {job.companyInfo.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Location:</span>
                      <span className="ml-1 text-foreground">{job.companyInfo.location}</span>
                    </div>
                  )}
                  
                  {job.companyInfo.website && (
                    <div className="flex items-center text-sm">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a 
                        href={job.companyInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Recruiter Info */}
            {(job.recruiter.name || job.recruiter.title) && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card p-6 rounded-2xl border border-border"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Your Recruiter</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    {job.recruiter.name && (
                      <p className="font-medium text-foreground">{job.recruiter.name}</p>
                    )}
                    {job.recruiter.title && (
                      <p className="text-sm text-muted-foreground">{job.recruiter.title}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 