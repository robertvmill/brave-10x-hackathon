'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import RealtimeVoiceAssistant from '@/components/realtime-voice-assistant'

export default function CreateVoiceJobPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard/recruiter">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="text-center">
              <h1 className="text-lg font-semibold">OpenAI Realtime Voice Creation</h1>
              <p className="text-sm text-muted-foreground">Create job postings with advanced AI conversation</p>
            </div>
            
            <Link href="/jobs/create">
              <Button variant="outline">
                Use Form Instead
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Voice Assistant Component */}
        <div className="flex justify-center">
          <RealtimeVoiceAssistant />
        </div>
      </div>
    </div>
  )
} 