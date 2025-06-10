'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Calendar,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  MapPin,
  DollarSign,
  Clock,
  ChevronsUpDown,
  LayoutDashboard,
  Settings,
  UserCircle,
  LogOut,
  Building2,
  FileText,
  BarChart3,
  MessageSquare,
  Mic
} from 'lucide-react'

interface JobPosting {
  id: string
  title: string
  company: string
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  jobType: string
  experienceLevel: string | null
  postedTime: string
  isActive: boolean
  applications: number
  views: number
}

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
  },
}

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
}

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
}

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
}

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
}

function RecruiterSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const pathname = usePathname()
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
        "sidebar fixed left-0 z-40 h-full shrink-0 border-r"
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={`relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-background transition-all`}
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
                      href="/dashboard/recruiter"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname === "/dashboard/recruiter" && "bg-muted text-blue-600"
                      )}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Dashboard</p>
                        )}
                      </motion.li>
                    </Link>
                    <Link
                      href="/jobs/manage"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/jobs/manage") && "bg-muted text-blue-600"
                      )}
                    >
                      <Briefcase className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Job Postings</p>
                        )}
                      </motion.li>
                    </Link>
                    <Link
                      href="/jobs/create"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname === "/jobs/create" && "bg-muted text-blue-600"
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Create Job</p>
                        )}
                      </motion.li>
                    </Link>
                    <Link
                      href="/jobs/create-voice"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname === "/jobs/create-voice" && "bg-muted text-blue-600"
                      )}
                    >
                      <Mic className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Create with Voice</p>
                        )}
                      </motion.li>
                    </Link>
                    <Link
                      href="/applications"
                      className={cn(
                        "flex h-8 flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/applications") && "bg-muted text-blue-600"
                      )}
                    >
                      <Users className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Applications</p>
                        )}
                      </motion.li>
                    </Link>
                    <Link
                      href="/candidates"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/candidates") && "bg-muted text-blue-600"
                      )}
                    >
                      <UserCircle className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Candidates</p>
                        )}
                      </motion.li>
                    </Link>
                    <Link
                      href="/analytics"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/analytics") && "bg-muted text-blue-600"
                      )}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Analytics</p>
                        )}
                      </motion.li>
                    </Link>
                    <Link
                      href="/company"
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                        pathname?.includes("/company") && "bg-muted text-blue-600"
                      )}
                    >
                      <Building2 className="h-4 w-4" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-2 text-sm font-medium">Company</p>
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
                      <p className="ml-2 text-sm font-medium">Settings</p>
                    )}
                  </motion.li>
                </Link>
                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="w-full">
                      <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary">
                        <Avatar className="size-4">
                          <AvatarFallback>
                            {user?.fullName?.charAt(0) || 'R'}
                          </AvatarFallback>
                        </Avatar>
                        <motion.li
                          variants={variants}
                          className="flex w-full items-center gap-2"
                        >
                          {!isCollapsed && (
                            <>
                              <p className="text-sm font-medium">{user?.fullName || 'Recruiter'}</p>
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
                            {user?.fullName?.charAt(0) || 'R'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium">
                            {user?.fullName || 'Recruiter'}
                          </span>
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {user?.email || 'recruiter@example.com'}
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
                        asChild
                        className="flex items-center gap-2"
                      >
                        <Link href="/company">
                          <Building2 className="h-4 w-4" /> Company Settings
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
  )
}

export default function RecruiterDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)

  // Redirect if not authenticated or not a recruiter
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }
      if (user.userType !== 'recruiter') {
        router.push('/dashboard/candidate')
        return
      }
    }
  }, [user, loading, router])

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setIsLoadingJobs(true)
      console.log('🔄 Fetching jobs...')
      
      const response = await fetch('/api/jobs')
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      
      const data = await response.json()
      console.log('✅ Jobs fetched:', data)
      
      if (data.success && data.jobs) {
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error('❌ Error fetching jobs:', error)
      // Fall back to existing mock data logic
      const mockJobs: JobPosting[] = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          company: user?.company || 'Your Company',
          location: 'San Francisco, CA',
          salaryMin: 120000,
          salaryMax: 180000,
          jobType: 'Full-time',
          experienceLevel: 'Senior',
          postedTime: '2 days ago',
          isActive: true,
          applications: 23,
          views: 156
        }
      ]
      setJobs(mockJobs)
    } finally {
      setIsLoadingJobs(false)
    }
  }

  useEffect(() => {
    if (user && user.userType === 'recruiter') {
      fetchJobs()
    }
  }, [user])

  // Refetch jobs when returning to the page (in case jobs were created)
  useEffect(() => {
    const handleFocus = () => {
      if (user && user.userType === 'recruiter') {
        fetchJobs()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user])

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min || !max) return 'Salary not specified'
    
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `${Math.round(num / 1000)}k`
      }
      return num.toString()
    }
    
    return `$${formatNumber(min)} - $${formatNumber(max)}`
  }

  const totalApplications = jobs.reduce((sum, job) => sum + job.applications, 0)
  const totalViews = jobs.reduce((sum, job) => sum + job.views, 0)
  const activeJobs = jobs.filter(job => job.isActive).length

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-row">
      <RecruiterSidebar />
      <main className="flex h-screen grow flex-col overflow-auto pl-[3.05rem]">
        <div className="min-h-screen bg-background">
          {/* Background Geometric Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-muted/10 blur-3xl"></div>
            <div className="absolute top-1/2 -left-32 w-72 h-72 rounded-full bg-muted/10 blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-muted/5 blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Welcome back, {user.fullName?.split(' ')[0] || 'Recruiter'}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your job postings and track applications
                  </p>
                </div>
                
                {/* Simplified to just 2 buttons */}
                <div className="flex items-center gap-3">
                  <Link href="/jobs/create">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Job
                    </Button>
                  </Link>
                  
                  <Link href="/jobs/create-voice">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      <Mic className="h-4 w-4 mr-2" />
                      Voice Assistant
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-card/70 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeJobs}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/70 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalApplications}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last week
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/70 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalViews}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last week
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/70 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Response Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18%</div>
                  <p className="text-xs text-muted-foreground">
                    +3% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="jobs" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="jobs">Job Postings</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="jobs" className="space-y-6">
                <Card className="bg-card/70 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Your Job Postings</CardTitle>
                        <CardDescription>
                          Manage and track your active job listings
                        </CardDescription>
                      </div>
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Manage All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingJobs ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading job postings...</p>
                      </div>
                    ) : jobs.length === 0 ? (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No job postings yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first job posting to start attracting candidates.
                        </p>
                        
                        {/* Simplified to just 2 buttons */}
                        <div className="flex items-center justify-center gap-3">
                          <Link href="/jobs/create">
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                              <Plus className="h-4 w-4 mr-2" />
                              Create Job
                            </Button>
                          </Link>
                          
                          <Link href="/jobs/create-voice">
                            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                              <Mic className="h-4 w-4 mr-2" />
                              Voice Assistant
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {jobs.map((job) => (
                          <div
                            key={job.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/50"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-foreground">{job.title}</h3>
                                <Badge 
                                  variant={job.isActive ? "default" : "secondary"}
                                  className={job.isActive ? "bg-green-100 text-green-800" : ""}
                                >
                                  {job.isActive ? 'Active' : 'Paused'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {job.location || 'Remote'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {formatSalary(job.salaryMin, job.salaryMax)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {job.postedTime}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-center">
                                <div className="font-semibold text-foreground">{job.applications}</div>
                                <div className="text-muted-foreground">Applications</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-foreground">{job.views}</div>
                                <div className="text-muted-foreground">Views</div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="space-y-6">
                <Card className="bg-card/70 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>
                      Review and manage candidate applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Applications Coming Soon</h3>
                      <p className="text-muted-foreground">
                        This feature will show candidate applications for your job postings.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card className="bg-card/70 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                    <CardDescription>
                      Track your recruitment performance and insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Coming Soon</h3>
                      <p className="text-muted-foreground">
                        Detailed analytics and insights will be available here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
} 