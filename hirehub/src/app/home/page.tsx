'use client'

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
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
import {
  ChevronsUpDown,
  FileClock,
  Layout,
  LayoutDashboard,
  LogOut,
  Settings,
  UserCircle,
  UserSearch,
  Search, 
  Upload,
  MessageSquare,
  HelpCircle,
  FileText,
  Briefcase,
  CreditCard,
  Users,
  BarChart3
} from "lucide-react";
import { ThemeToggle } from '@/components/theme-toggle'

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

function HomeSidebar() {
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
                      <Search className="h-4 w-4" />
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
                      <FileText className="h-4 w-4" />
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
                      <MessageSquare className="h-4 w-4" />
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
                      <CreditCard className="h-4 w-4" />
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
                            {user?.fullName?.charAt(0) || 'R'}
                          </AvatarFallback>
                        </Avatar>
                        <motion.li
                          variants={variants}
                          className="flex w-full items-center gap-2"
                        >
                          {!isCollapsed && (
                            <>
                              <p className="text-sm font-medium">{user?.fullName || 'Robert'}</p>
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
                            {user?.fullName || 'Robert'}
                          </span>
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {user?.email || 'robert@example.com'}
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

export default function HomePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('applications')

  const importantTasks = [
    {
      id: 1,
      title: 'Upload your resume',
      description: 'Get automatically considered for opportunities matching your skills',
      action: 'Upload now',
      icon: Upload,
      href: '/resume'
    },
    {
      id: 2,
      title: 'Practice interviews',
      description: 'Prepare for your next opportunity with 150+ live interviews ready to take',
      action: 'Start now',
      icon: MessageSquare,
      href: '/interviews'
    }
  ]

  const stats = {
    contracts: 0,
    applications: 0,
    referrals: 0
  }

  return (
    <div className="flex h-screen w-screen flex-row">
      <HomeSidebar />
      <main className="flex h-screen grow flex-col overflow-auto pl-[3.05rem]">
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="bg-card border-b border-border px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Welcome back, {user?.fullName?.split(' ')[0] || 'Robert'}
                </h1>
                <p className="text-muted-foreground mt-1">Important tasks</p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Support
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </div>

          <div className="px-8 py-6">
            {/* Important Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {importantTasks.map((task) => {
                const IconComponent = task.icon
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: task.id * 0.1 }}
                    className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <IconComponent className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground mb-2">
                          {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {task.description}
                        </p>
                        <Button 
                          asChild
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Link href={task.href}>
                            {task.action}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Stats Tabs */}
            <div className="bg-card rounded-lg border border-border">
              <div className="border-b border-border">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: 'contracts', label: 'Contracts', count: stats.contracts },
                    { key: 'applications', label: 'Applications', count: stats.applications },
                    { key: 'referrals', label: 'Referrals', count: stats.referrals }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                        activeTab === tab.key
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab.label}
                      <span className="ml-2 bg-muted text-muted-foreground py-0.5 px-2 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    You don't have any {activeTab} yet
                  </h3>
                  <p className="text-muted-foreground">
                    All your {activeTab} will be visible here
                  </p>
                  {activeTab === 'applications' && (
                    <Button 
                      asChild
                      className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Link href="/jobs">
                        Browse Jobs
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 