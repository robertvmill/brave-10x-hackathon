'use client'

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Rocket, 
  BarChart3, 
  Briefcase, 
  Monitor, 
  Users
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

export default function CandidateOnboarding() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [opportunities, setOpportunities] = useState(jobOpportunities)
  const router = useRouter()

  const handleOpportunityToggle = (id: string) => {
    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === id ? { ...opp, selected: !opp.selected } : opp
      )
    )
  }

  const selectedCount = opportunities.filter(opp => opp.selected).length

  const handleCompleteOnboarding = () => {
    if (selectedCount > 0) {
      console.log('Selected opportunities:', opportunities.filter(opp => opp.selected))
      // In real app, save selections to user profile and mark onboarding as complete
      // Then redirect to main dashboard
      router.push('/dashboard/candidate')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <Avatar className="mx-auto h-16 w-16 mb-4">
              <AvatarFallback className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg">
                {user?.fullName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-semibold text-foreground">
              Welcome to HireHub, {user?.fullName?.split(' ')[0] || 'Candidate'}!
            </h1>
          </div>
          
          <h2 className="text-4xl font-bold text-foreground mb-4">
            What kind of opportunities are you looking for?
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
            <div className="bg-primary h-2 rounded-full" style={{width: '100%'}}></div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Profile setup</span>
            <span className="font-medium text-primary">Complete onboarding</span>
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={handleCompleteOnboarding}
            disabled={selectedCount === 0}
            className={`px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 ${
              selectedCount > 0
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            Complete Onboarding {selectedCount > 0 && `(${selectedCount} selected)`}
          </Button>
          {selectedCount === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Please select at least one opportunity to continue
            </p>
          )}
          
          <div className="mt-6">
            <Link
              href="/dashboard/candidate"
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Skip for now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 