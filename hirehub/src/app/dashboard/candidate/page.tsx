'use client'

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride'
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  HelpCircle,
  MapPin
} from "lucide-react";

interface JobOpportunity {
  id: string
  title: string
  company: string
  type: 'Full-time' | 'Part-time' | 'Contractor'
  icon: any
  selected: boolean
}

const jobOpportunities: JobOpportunity[] = [
  {
    id: '1',
    title: 'Senior AI Solutions Architect',
    company: 'Leading Tech Consultancy',
    type: 'Full-time',
    icon: Settings,
    selected: false
  },
  {
    id: '2',
    title: 'Innovation Strategist',
    company: 'Healthcare Technology Startup',
    type: 'Full-time',
    icon: Rocket,
    selected: false
  },
  {
    id: '3',
    title: 'Principal Data Analyst',
    company: 'Major Financial Services Firm',
    type: 'Full-time',
    icon: BarChart3,
    selected: false
  },
  {
    id: '4',
    title: 'Lead Product Manager for AI Solutions',
    company: 'Fast-Growing Fintech Company',
    type: 'Full-time',
    icon: Briefcase,
    selected: false
  },
  {
    id: '5',
    title: 'Digital Transformation Consultant',
    company: 'Global Management Consulting Firm',
    type: 'Contractor',
    icon: Users,
    selected: false
  },
  {
    id: '6',
    title: 'Technical Sales Engineer',
    company: 'Emerging AI Startup',
    type: 'Part-time',
    icon: Monitor,
    selected: false
  }
]

// Tour steps configuration
const tourSteps: Step[] = [
  {
    target: '.tour-welcome',
    content: 'Welcome to HireHub! This is your personalized dashboard where you can explore job opportunities and manage your career journey.',
    placement: 'bottom'
  },
  {
    target: '.tour-opportunities',
    content: 'Here you\'ll find AI-powered job recommendations based on your skills, experience, and preferences. These are personalized matches just for you!',
    placement: 'right'
  },
  {
    target: '.tour-apply-button',
    content: 'Click these "Apply" buttons to quickly apply to jobs that interest you. Your profile will be automatically shared with recruiters.',
    placement: 'left'
  },
  {
    target: '.tour-profile-completion',
    content: 'Keep track of your profile completion here. A complete profile gets better job matches and more recruiter views!',
    placement: 'left'
  },
  {
    target: '.tour-activity',
    content: 'Monitor your job search activity - applications sent, profile views, and saved jobs all in one place.',
    placement: 'left'
  },
  {
    target: '.tour-sidebar',
    content: 'Use this sidebar to navigate between different sections: Explore jobs, manage your Home, update your Resume, track Interviews, and handle Payments.',
    placement: 'right'
  },
  {
    target: '.tour-explore',
    content: 'Click "Explore" to browse all available job opportunities with advanced search and filtering options.',
    placement: 'right'
  }
]

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
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary tour-explore",
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

export default function CandidateDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [opportunities, setOpportunities] = useState(jobOpportunities)
  
  // Tour state
  const [runTour, setRunTour] = useState(false)
  const [tourStepIndex, setTourStepIndex] = useState(0)
  
  // For returning users, skip directly to the main dashboard
  // In a real app, you'd check if user has completed onboarding from their profile
  const isReturningUser = true // Simulate returning user - in real app, check user.hasCompletedOnboarding

  const handleOpportunityToggle = (id: string) => {
    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === id ? { ...opp, selected: !opp.selected } : opp
      )
    )
  }

  const handleApplyToJob = (jobId: string) => {
    router.push(`/apply/${jobId}`);
  }

  // Tour callback handler
  const handleTourCallback = (data: CallBackProps) => {
    const { status, action, index, size, type } = data
    
    if (status === 'finished' || status === 'skipped') {
      setRunTour(false)
      setTourStepIndex(0)
    } else if (action === 'next') {
      setTourStepIndex(index + 1)
    } else if (action === 'prev') {
      setTourStepIndex(index - 1)
    }
  }

  const startTour = () => {
    setRunTour(true)
    setTourStepIndex(0)
  }

  // For returning users, show the main dashboard directly
  if (isReturningUser) {
    // Simulate some selected opportunities for the returning user
    const selectedOpportunities = opportunities.slice(0, 3).map(opp => ({...opp, selected: true}))
    
    return (
      <div className="flex h-screen w-screen flex-row">
        <div className="tour-sidebar">
          <CandidateSidebar />
        </div>
        <main className="flex h-screen grow flex-col overflow-auto pl-[3.05rem]">
          <div className="p-6">
            <div className="mb-8 tour-welcome">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    Welcome back, {user?.fullName || 'Candidate'}!
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Here are your AI-powered job recommendations based on your preferences.
                  </p>
                </div>
                <Button
                  onClick={startTour}
                  variant="outline"
                  className="flex items-center gap-2 hover:bg-primary/10 border-primary/20"
                >
                  <HelpCircle className="h-4 w-4" />
                  Take Tour
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card rounded-2xl shadow-sm border border-border p-6 tour-opportunities">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  🎯 Recommended Opportunities
                </h3>
                <div className="space-y-4">
                  {selectedOpportunities.map((opp, index) => {
                    const IconComponent = opp.icon
                    return (
                      <div key={opp.id} className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{opp.title}</h4>
                            <p className="text-sm text-muted-foreground">at {opp.company}</p>
                            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                              opp.type === 'Full-time'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : opp.type === 'Part-time'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            }`}>
                              {opp.type}
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            className={`bg-primary hover:bg-primary/90 text-primary-foreground ${
                              index === 0 ? 'tour-apply-button' : ''
                            }`}
                            onClick={() => handleApplyToJob(opp.id)}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card rounded-2xl shadow-sm border border-border p-6 tour-profile-completion">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Profile Completion</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Profile strength</span>
                      <span className="font-medium text-foreground">75%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Complete your profile to get better matches
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-2xl shadow-sm border border-border p-6 tour-activity">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Your Activity</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Applications</span>
                      <span className="font-medium text-foreground">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profile views</span>
                      <span className="font-medium text-foreground">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saved jobs</span>
                      <span className="font-medium text-foreground">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // This would only show for first-time users who haven't completed onboarding
  const selectedCount = opportunities.filter(opp => opp.selected).length

  const handleNextStep = () => {
    if (selectedCount > 0) {
      console.log('Selected opportunities:', opportunities.filter(opp => opp.selected))
      // In real app, save selections to user profile and mark onboarding as complete
      // Then redirect to main dashboard
      window.location.reload() // Simulate completing onboarding
    }
  }

  return (
    <div className="flex h-screen w-screen flex-row">
      <div className="tour-sidebar">
        <CandidateSidebar />
      </div>
      <main className="flex h-screen grow flex-col overflow-auto pl-[3.05rem]">
        <div className="min-h-screen bg-background">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Complete Your Profile Setup
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Select one or more opportunities you're most interested in to get personalized recommendations
              </p>

              <div className="max-w-2xl mx-auto mb-12">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search for specific roles or companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 py-3 text-lg bg-background border-border"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {opportunities.map((opportunity) => {
                const IconComponent = opportunity.icon
                return (
                  <div
                    key={opportunity.id}
                    onClick={() => handleOpportunityToggle(opportunity.id)}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                      opportunity.selected
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-border bg-card hover:shadow-md'
                    }`}
                  >
                    {opportunity.selected && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${
                        opportunity.selected 
                          ? 'bg-primary/20' 
                          : 'bg-muted'
                      }`}>
                        <IconComponent className={`h-6 w-6 ${
                          opportunity.selected
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {opportunity.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          at {opportunity.company}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          opportunity.type === 'Full-time'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : opportunity.type === 'Part-time'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        }`}>
                          {opportunity.type}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mb-8">
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div className="bg-primary h-2 rounded-full" style={{width: '50%'}}></div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Upload resume</span>
                <span className="font-medium text-primary">Complete profile setup</span>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={handleNextStep}
                disabled={selectedCount === 0}
                className={`px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  selectedCount > 0
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                Complete Setup {selectedCount > 0 && `(${selectedCount} selected)`}
              </Button>
              {selectedCount === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Please select at least one opportunity to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}