'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Volume2, VolumeX, Send, RotateCcw } from 'lucide-react'
import { useAuth } from '@/context/auth-context'

interface JobData {
  title: string
  description: string
  requirements: string
  jobType: string
  experienceLevel: string
  salaryMin: number | null
  salaryMax: number | null
  location: string
  remoteAllowed: boolean
  skillsRequired: string[]
  skillsPreferred: string[]
}

export default function VoiceJobAssistant() {
  const { user } = useAuth()
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentStep, setCurrentStep] = useState('greeting')
  const [conversation, setConversation] = useState<Array<{role: 'assistant' | 'user', content: string}>>([])
  const [jobData, setJobData] = useState<JobData>({
    title: '',
    description: '',
    requirements: '',
    jobType: '',
    experienceLevel: '',
    salaryMin: null,
    salaryMax: null,
    location: '',
    remoteAllowed: false,
    skillsRequired: [],
    skillsPreferred: []
  })

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  const steps = [
    'greeting',
    'title',
    'description',
    'requirements',
    'job_type',
    'experience_level',
    'location',
    'salary',
    'skills_required',
    'skills_preferred',
    'review',
    'submit'
  ]

  const stepPrompts: Record<string, string> = {
    greeting: "Hi there! I'm here to help you create a job posting through voice. What position would you like to post?",
    title: "Great! What's the job title for this position?",
    description: "Perfect! Now tell me about this role. What are the main responsibilities and what makes this position exciting?",
    requirements: "Now, what are the key requirements and qualifications needed for this role?",
    job_type: "What type of employment is this? Full-time, Part-time, Contract, Freelance, or Internship?",
    experience_level: "What experience level are you looking for? Entry level, Mid level, Senior level, or Executive level?",
    location: "Where is this position located? Also, is remote work allowed?",
    salary: "What's the salary range for this position? You can skip this if you prefer not to specify.",
    skills_required: "What are the essential skills or technologies required for this role?",
    skills_preferred: "Are there any nice-to-have skills that would be beneficial but not required?",
    review: "Let me review the job posting with you. Does everything look correct?",
    submit: "Perfect! I'll create this job posting for you now."
  }

  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // Type assertion to handle browser compatibility
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          handleUserSpeech(transcript)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
        
        recognitionRef.current = recognition
      }
    }

    // Start with greeting
    if (currentStep === 'greeting') {
      speakText(stepPrompts.greeting)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const speakText = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      
      synthRef.current.speak(utterance)
      
      setConversation(prev => [...prev, { role: 'assistant', content: text }])
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const handleUserSpeech = (transcript: string) => {
    setConversation(prev => [...prev, { role: 'user', content: transcript }])
    parseUserInput(transcript)
  }

  const parseUserInput = (text: string) => {
    const textLower = text.toLowerCase()
    let nextResponse = ""
    
    switch (currentStep) {
      case 'greeting':
      case 'title':
        setJobData(prev => ({ ...prev, title: text.trim() }))
        nextResponse = stepPrompts.description.replace('Perfect!', `Perfect! For the ${text.trim()} position,`)
        advanceStep()
        break
        
      case 'description':
        setJobData(prev => ({ ...prev, description: text.trim() }))
        nextResponse = stepPrompts.requirements
        advanceStep()
        break
        
      case 'requirements':
        setJobData(prev => ({ ...prev, requirements: text.trim() }))
        nextResponse = stepPrompts.job_type
        advanceStep()
        break
        
      case 'job_type':
        const jobTypeMapping: Record<string, string> = {
          'full': 'Full_time',
          'part': 'Part_time',
          'contract': 'Contractor',
          'freelance': 'Freelance',
          'intern': 'Internship'
        }
        
        let jobType = ''
        for (const [key, value] of Object.entries(jobTypeMapping)) {
          if (textLower.includes(key)) {
            jobType = value
            break
          }
        }
        
        if (jobType) {
          setJobData(prev => ({ ...prev, jobType }))
          nextResponse = stepPrompts.experience_level
          advanceStep()
        } else {
          nextResponse = "I didn't catch that. Could you please specify: Full-time, Part-time, Contract, Freelance, or Internship?"
        }
        break
        
      case 'experience_level':
        const expMapping: Record<string, string> = {
          'entry': 'Entry',
          'junior': 'Entry',
          'mid': 'Mid',
          'senior': 'Senior',
          'executive': 'Executive',
          'lead': 'Executive'
        }
        
        let experienceLevel = ''
        for (const [key, value] of Object.entries(expMapping)) {
          if (textLower.includes(key)) {
            experienceLevel = value
            break
          }
        }
        
        if (experienceLevel) {
          setJobData(prev => ({ ...prev, experienceLevel }))
          nextResponse = stepPrompts.location
          advanceStep()
        } else {
          nextResponse = "Could you clarify the experience level? Entry, Mid, Senior, or Executive level?"
        }
        break
        
      case 'location':
        setJobData(prev => ({ 
          ...prev, 
          location: text.trim(),
          remoteAllowed: ['remote', 'anywhere', 'work from home', 'wfh'].some(word => textLower.includes(word))
        }))
        nextResponse = stepPrompts.salary
        advanceStep()
        break
        
      case 'salary':
        if (textLower.includes('skip') || textLower.includes('no') || textLower.includes('pass')) {
          nextResponse = stepPrompts.skills_required
          advanceStep()
        } else {
          const numbers = text.match(/\d+,?\d*/g)
          if (numbers && numbers.length >= 2) {
            setJobData(prev => ({
              ...prev,
              salaryMin: parseInt(numbers[0].replace(',', '')),
              salaryMax: parseInt(numbers[1].replace(',', ''))
            }))
          } else if (numbers && numbers.length === 1) {
            setJobData(prev => ({
              ...prev,
              salaryMin: parseInt(numbers[0].replace(',', ''))
            }))
          }
          nextResponse = stepPrompts.skills_required
          advanceStep()
        }
        break
        
      case 'skills_required':
        const requiredSkills = text.split(/[,;]|\sand\s/).map(skill => skill.trim()).filter(Boolean)
        setJobData(prev => ({ ...prev, skillsRequired: requiredSkills }))
        nextResponse = stepPrompts.skills_preferred
        advanceStep()
        break
        
      case 'skills_preferred':
        const preferredSkills = text.split(/[,;]|\sand\s/).map(skill => skill.trim()).filter(Boolean)
        setJobData(prev => ({ ...prev, skillsPreferred: preferredSkills }))
        nextResponse = generateReviewSummary()
        advanceStep()
        break
        
      case 'review':
        if (textLower.includes('yes') || textLower.includes('correct') || textLower.includes('good')) {
          nextResponse = stepPrompts.submit
          advanceStep()
        } else {
          nextResponse = "What would you like to change? You can say 'change title', 'change description', etc."
        }
        break
        
      default:
        nextResponse = "I'm not sure how to help with that. Could you try again?"
    }
    
    setTimeout(() => speakText(nextResponse), 1000)
  }

  const advanceStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const generateReviewSummary = () => {
    const skills = jobData.skillsRequired.join(', ')
    const preferredSkills = jobData.skillsPreferred.join(', ')
    const salary = jobData.salaryMin && jobData.salaryMax 
      ? `$${jobData.salaryMin.toLocaleString()} to $${jobData.salaryMax.toLocaleString()}`
      : jobData.salaryMin 
        ? `Starting at $${jobData.salaryMin.toLocaleString()}`
        : 'Not specified'
    
    return `Here's your job posting: ${jobData.title}, ${jobData.jobType.replace('_', '-')} position, ${jobData.experienceLevel} level, located in ${jobData.location}${jobData.remoteAllowed ? ' with remote work allowed' : ''}. Salary range: ${salary}. Required skills: ${skills}. Preferred skills: ${preferredSkills}. Does this look correct?`
  }

  const submitJobPosting = async () => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      })
      
      if (response.ok) {
        speakText("Great! Your job posting has been created successfully. You can view it in your dashboard.")
        setCurrentStep('complete')
      } else {
        speakText("I encountered an error creating the job posting. Please try again or use the manual form.")
      }
    } catch (error) {
      speakText("There was a technical issue. Please try again later.")
    }
  }

  const resetConversation = () => {
    setCurrentStep('greeting')
    setJobData({
      title: '',
      description: '',
      requirements: '',
      jobType: '',
      experienceLevel: '',
      salaryMin: null,
      salaryMax: null,
      location: '',
      remoteAllowed: false,
      skillsRequired: [],
      skillsPreferred: []
    })
    setConversation([])
    speakText(stepPrompts.greeting)
  }

  const toggleMute = () => {
    if (synthRef.current) {
      if (isSpeaking) {
        synthRef.current.cancel()
        setIsSpeaking(false)
      }
    }
  }

  if (currentStep === 'submit') {
    submitJobPosting()
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Job Posting Assistant
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Speak naturally to create your job posting. I'll guide you through each step.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Step Indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          {steps.slice(0, -1).map((step, index) => (
            <Badge 
              key={step}
              variant={steps.indexOf(currentStep) > index ? "default" : 
                      steps.indexOf(currentStep) === index ? "secondary" : "outline"}
              className="text-xs"
            >
              {step.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          ))}
        </div>

        {/* Conversation Display */}
        <div className="bg-muted/30 rounded-lg p-4 max-h-60 overflow-y-auto space-y-3">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background border'
              }`}>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {isSpeaking && (
            <div className="flex justify-start">
              <div className="bg-background border p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">🎤 Speaking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Job Data Preview */}
        {jobData.title && (
          <div className="border rounded-lg p-4 bg-background/50">
            <h3 className="font-medium mb-2">Current Job Details:</h3>
            <div className="text-sm space-y-1 text-muted-foreground">
              {jobData.title && <p><strong>Title:</strong> {jobData.title}</p>}
              {jobData.jobType && <p><strong>Type:</strong> {jobData.jobType.replace('_', '-')}</p>}
              {jobData.experienceLevel && <p><strong>Level:</strong> {jobData.experienceLevel}</p>}
              {jobData.location && <p><strong>Location:</strong> {jobData.location}</p>}
              {jobData.skillsRequired.length > 0 && (
                <p><strong>Required Skills:</strong> {jobData.skillsRequired.join(', ')}</p>
              )}
            </div>
          </div>
        )}

        {/* Voice Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="flex items-center gap-2"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isListening ? "Stop Listening" : "Start Speaking"}
          </Button>
          
          <Button
            onClick={toggleMute}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {isSpeaking ? "Mute" : "Unmute"}
          </Button>
          
          <Button
            onClick={resetConversation}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Browser Support Check */}
        {(typeof window !== 'undefined' && !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) && (
          <div className="text-center p-4 bg-destructive/10 text-destructive rounded-lg">
            <p className="text-sm">
              Voice recognition is not supported in your browser. Please use Chrome or Edge for the best experience.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 