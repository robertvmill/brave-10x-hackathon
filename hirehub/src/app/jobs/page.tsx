'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import {
  ChevronsUpDown,
  FileClock,
  GraduationCap,
  Layout,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  MessagesSquare,
  Settings,
  UserCircle,
  UserCog,
  UserSearch,
  Search, 
  Rocket, 
  BarChart3, 
  Briefcase, 
  Monitor, 
  Users,
  MapPin,
  Clock,
  DollarSign,
  Star,
  BookmarkPlus,
  Bookmark,
  Filter,
  ArrowUpDown,
  Loader2
} from "lucide-react";

// Type definitions for job data
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

function JobsSidebar() {
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
                      href="/applications"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("applications") &&
                          "bg-muted text-blue-600"
                      )}
                    >
                      <FileClock className="h-4 w-4" />
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

export default function JobsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [filterBy, setFilterBy] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/jobs')
        if (!response.ok) {
          throw new Error('Failed to fetch jobs')
        }
        const jobsData = await response.json()
        setJobs(jobsData)
      } catch (err) {
        setError('Failed to load jobs. Please try again later.')
        console.error('Error fetching jobs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.skillsRequired.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (filterBy === 'featured') return job.featured && matchesSearch
    if (filterBy === 'remote') return job.remoteAllowed && matchesSearch
    if (filterBy === 'fulltime') return job.jobType === 'Full_time' && matchesSearch
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-row">
        <JobsSidebar />
        <main className="flex h-screen grow flex-col overflow-auto pl-[3.05rem]">
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-background to-cyan-50 dark:from-muted dark:via-background dark:to-indigo-950 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading job opportunities...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-row">
        <JobsSidebar />
        <main className="flex h-screen grow flex-col overflow-auto pl-[3.05rem]">
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-background to-cyan-50 dark:from-muted dark:via-background dark:to-indigo-950 flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-row">
      <JobsSidebar />
      <main className="flex h-screen grow flex-col overflow-auto pl-[3.05rem]">
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-background to-cyan-50 dark:from-muted dark:via-background dark:to-indigo-950 relative overflow-hidden">
          {/* Background Geometric Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 opacity-10 blur-3xl"></div>
            <div className="absolute top-1/2 -left-32 w-72 h-72 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 opacity-10 blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 opacity-5 blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                Explore{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  opportunities
                </span>
              </h1>
              <p className="text-lg leading-8 text-muted-foreground">
                Discover your next career move with AI-powered job matching
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search jobs, companies, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-background/70 backdrop-blur-sm border-border shadow-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant={filterBy === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterBy('all')}
                  className={cn(
                    "whitespace-nowrap transition-all",
                    filterBy === 'all' 
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                      : "border-border hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  Trending
                </Button>
                <Button 
                  variant={filterBy === 'featured' ? 'default' : 'outline'}
                  onClick={() => setFilterBy('featured')}
                  className={cn(
                    "whitespace-nowrap transition-all",
                    filterBy === 'featured' 
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                      : "border-border hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  Newest
                </Button>
                <Button 
                  variant={filterBy === 'remote' ? 'default' : 'outline'}
                  onClick={() => setFilterBy('remote')}
                  className={cn(
                    "whitespace-nowrap transition-all",
                    filterBy === 'remote' 
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                      : "border-border hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  Most pay
                </Button>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all transform hover:scale-105">
                  <Star className="h-4 w-4 mr-2" />
                  Refer & earn
                </Button>
              </div>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card/70 backdrop-blur-sm rounded-lg border border-border/50 p-6 hover:shadow-lg hover:bg-card/90 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm ${
                          job.company === 'OpenAI' ? 'bg-gradient-to-br from-gray-800 to-black' :
                          job.company === 'Talent pool' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' :
                          'bg-gradient-to-br from-gray-500 to-gray-700'
                        }`}>
                          {job.company.charAt(0)}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          {job.featured && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-yellow-300 shadow-sm">
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-foreground mb-2 font-medium">
                          {formatSalary(job.salaryMin, job.salaryMax, job.jobType)} • {job.company}
                        </p>
                        
                        {job.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {job.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location || 'Location not specified'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.postedTime}
                          </div>
                          {job.remoteAllowed && (
                            <div className="flex items-center gap-1">
                              <span className="text-green-600 dark:text-green-400 font-medium">Remote OK</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.skillsRequired.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skillsRequired.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skillsRequired.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side actions */}
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveJob(job.id)}
                          className="p-2 hover:bg-accent hover:text-accent-foreground"
                        >
                          {savedJobs.includes(job.id) ? (
                            <Bookmark className="h-4 w-4 text-primary fill-current" />
                          ) : (
                            <BookmarkPlus className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          className={`shadow-sm transition-all transform hover:scale-105 ${
                            job.jobType === 'Full_time' 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500' 
                              : job.jobType === 'Contractor'
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500'
                              : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500'
                          } text-white border-0`}
                        >
                          {job.jobType.replace('_', ' ')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredJobs.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2 text-foreground">No jobs found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 