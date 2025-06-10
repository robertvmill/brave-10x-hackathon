'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus, MapPin, DollarSign, Briefcase, Clock } from 'lucide-react'

interface JobFormData {
  title: string
  description: string
  requirements: string
  jobType: string
  experienceLevel: string
  salaryMin: string
  salaryMax: string
  location: string
  remoteAllowed: boolean
  skillsRequired: string[]
  skillsPreferred: string[]
}

interface JobPostingFormProps {
  trigger?: React.ReactNode
  onJobCreated?: () => void
}

const jobTypes = [
  { value: 'Full_time', label: 'Full-time' },
  { value: 'Part_time', label: 'Part-time' },
  { value: 'Contractor', label: 'Contractor' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Internship', label: 'Internship' }
]

const experienceLevels = [
  { value: 'Entry', label: 'Entry Level (0-2 years)' },
  { value: 'Mid', label: 'Mid Level (2-5 years)' },
  { value: 'Senior', label: 'Senior Level (5-10 years)' },
  { value: 'Executive', label: 'Executive Level (10+ years)' }
]

export function JobPostingForm({ trigger, onJobCreated }: JobPostingFormProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentSkill, setCurrentSkill] = useState('')
  const [currentPreferredSkill, setCurrentPreferredSkill] = useState('')

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: '',
    jobType: '',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    location: '',
    remoteAllowed: false,
    skillsRequired: [],
    skillsPreferred: []
  })

  const handleInputChange = (field: keyof JobFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addSkill = (type: 'required' | 'preferred') => {
    const skill = type === 'required' ? currentSkill : currentPreferredSkill
    if (!skill.trim()) return

    const skillsField = type === 'required' ? 'skillsRequired' : 'skillsPreferred'
    const currentSkills = formData[skillsField]
    
    if (!currentSkills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        [skillsField]: [...currentSkills, skill.trim()]
      }))
    }

    if (type === 'required') {
      setCurrentSkill('')
    } else {
      setCurrentPreferredSkill('')
    }
  }

  const removeSkill = (skill: string, type: 'required' | 'preferred') => {
    const skillsField = type === 'required' ? 'skillsRequired' : 'skillsPreferred'
    setFormData(prev => ({
      ...prev,
      [skillsField]: prev[skillsField].filter(s => s !== skill)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || user.userType !== 'recruiter') {
      alert('Only recruiters can post jobs')
      return
    }

    setIsSubmitting(true)

    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel || null,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        location: formData.location || null,
        remoteAllowed: formData.remoteAllowed,
        skillsRequired: formData.skillsRequired,
        skillsPreferred: formData.skillsPreferred,
      }

      console.log('🚀 Submitting job data:', jobData)

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create job posting')
      }

      const newJob = await response.json()
      console.log('✅ Job created successfully:', newJob)

      // Reset form
      setFormData({
        title: '',
        description: '',
        requirements: '',
        jobType: '',
        experienceLevel: '',
        salaryMin: '',
        salaryMax: '',
        location: '',
        remoteAllowed: false,
        skillsRequired: [],
        skillsPreferred: []
      })

      setOpen(false)
      
      if (onJobCreated) {
        onJobCreated()
      }

      // Show success message
      alert('Job posting created successfully!')

    } catch (error) {
      console.error('❌ Error creating job:', error)
      alert(error instanceof Error ? error.message : 'Failed to create job posting')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.title && formData.description && formData.jobType

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create Job Posting</DialogTitle>
          <DialogDescription>
            Fill out the details below to post a new job opportunity
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="List the qualifications, experience, and skills required for this role..."
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobType">Job Type *</Label>
                  <Select 
                    value={formData.jobType} 
                    onValueChange={(value) => handleInputChange('jobType', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select 
                    value={formData.experienceLevel} 
                    onValueChange={(value) => handleInputChange('experienceLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Compensation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Compensation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. San Francisco, CA or Remote"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remoteAllowed"
                  checked={formData.remoteAllowed}
                  onCheckedChange={(checked) => handleInputChange('remoteAllowed', !!checked)}
                />
                <Label htmlFor="remoteAllowed">Remote work allowed</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryMin">Minimum Salary ($)</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="e.g. 120000"
                    value={formData.salaryMin}
                    onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="salaryMax">Maximum Salary ($)</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="e.g. 180000"
                    value={formData.salaryMax}
                    onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Required Skills */}
              <div>
                <Label>Required Skills</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Add a required skill"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('required'))}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => addSkill('required')}
                    disabled={!currentSkill.trim()}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skillsRequired.map((skill) => (
                    <Badge key={skill} variant="default" className="bg-red-100 text-red-800">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill, 'required')}
                        className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              <div>
                <Label>Preferred Skills (Nice to have)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Add a preferred skill"
                    value={currentPreferredSkill}
                    onChange={(e) => setCurrentPreferredSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('preferred'))}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => addSkill('preferred')}
                    disabled={!currentPreferredSkill.trim()}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skillsPreferred.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill, 'preferred')}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Job Posting'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 