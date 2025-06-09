'use client'

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
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
  Layout,
  LayoutDashboard,
  LogOut,
  Settings,
  UserCircle,
  UserSearch,
  MoreHorizontal,
  Calendar,
  Clock,
  Building2,
  CheckCircle,
  XCircle,
  Clock3
} from "lucide-react";

// Sample interview data
interface Interview {
  id: string
  title: string
  company: string
  type: 'Technical' | 'Behavioral' | 'System Design' | 'HR Screen'
  status: 'Completed' | 'Scheduled' | 'Cancelled'
  date: string
  duration?: string
}

const sampleInterviews: Interview[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer Interview',
    company: 'TechCorp Inc.',
    type: 'Technical',
    status: 'Completed',
    date: '2 days ago',
    duration: '45 min'
  },
  {
    id: '2',
    title: 'Product Manager - Behavioral Round',
    company: 'StartupXYZ',
    type: 'Behavioral',
    status: 'Completed',
    date: '1 week ago',
    duration: '30 min'
  },
  {
    id: '3',
    title: 'System Design Interview',
    company: 'BigTech Solutions',
    type: 'System Design',
    status: 'Completed',
    date: '2 weeks ago',
    duration: '60 min'
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

export default function InterviewsPage() {
  const [interviews] = useState<Interview[]>(sampleInterviews)
  
  const getStatusIcon = (status: Interview['status']) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case 'Scheduled':
        return <Clock3 className="h-4 w-4 text-blue-600" />
      case 'Cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: Interview['status']) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (status) {
      case 'Completed':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            Completed
          </Badge>
        )
      case 'Scheduled':
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Scheduled
          </Badge>
        )
      case 'Cancelled':
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            Cancelled
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeIcon = (type: Interview['type']) => {
    switch (type) {
      case 'Technical':
        return <span className="w-3 h-3 bg-purple-500 rounded-full" />
      case 'Behavioral':
        return <span className="w-3 h-3 bg-blue-500 rounded-full" />
      case 'System Design':
        return <span className="w-3 h-3 bg-green-500 rounded-full" />
      case 'HR Screen':
        return <span className="w-3 h-3 bg-orange-500 rounded-full" />
      default:
        return <span className="w-3 h-3 bg-gray-500 rounded-full" />
    }
  }

  return (
    <div className="flex h-screen w-screen flex-row">
      <CandidateSidebar />
      <main className="flex h-screen grow flex-col overflow-auto pl-[3.05rem]">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My interviews
            </h1>
            <p className="text-lg text-muted-foreground">
              See your past interviews
            </p>
          </div>

          {interviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileClock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No interviews yet
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                When you complete interviews, they'll appear here. Start exploring opportunities to schedule your first interview.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center">
                        {getTypeIcon(interview.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {interview.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-4 w-4" />
                            <span>{interview.company}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>•</span>
                            <span>{interview.date}</span>
                          </div>
                          {interview.duration && (
                            <>
                              <div className="flex items-center space-x-1">
                                <span>•</span>
                                <Clock className="h-4 w-4" />
                                <span>{interview.duration}</span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {interview.type}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          {getStatusBadge(interview.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(interview.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 hover:bg-muted rounded-md">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Download feedback</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Remove from history
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 