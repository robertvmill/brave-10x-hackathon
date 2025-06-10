# Voice Assistant Setup Guide

## 🎤 OpenAI Realtime Voice Assistant for Job Posting

This guide will help you set up and run the enhanced voice assistant that uses OpenAI's Realtime model with LiveKit for natural conversation-based job posting creation.

## ✅ Prerequisites

You already have the necessary environment variables:

```bash
OPENAI_API_KEY=<Your OpenAI API Key>
LIVEKIT_API_KEY=<your API Key>
LIVEKIT_API_SECRET=<your API Secret>
LIVEKIT_URL=wss://hirehub-epnu8ba6.livekit.cloud
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install \
  "livekit-agents[openai]~=1.0" \
  "livekit-plugins-noise-cancellation~=0.2" \
  "python-dotenv" \
  "httpx>=0.25.0"
```

### 2. Download Required Model Files

```bash
python job-posting-agent.py download-files
```

### 3. Start Your Next.js App (Required for API)

Make sure your Next.js application is running on port 3000:

```bash
npm run dev
```

The voice assistant needs to connect to your `/api/jobs` endpoint to create job postings.

### 4. Run the Voice Assistant

#### Option A: Console Mode (Terminal)
```bash
python job-posting-agent.py console
```

#### Option B: Connect to LiveKit Room
```bash
python job-posting-agent.py start
```

## 🎯 How It Works

### **Natural Conversation Flow**

The voice assistant will guide you through creating a job posting by asking about:

1. **Job Title** - "What position are you hiring for?"
2. **Job Description** - Role responsibilities and what makes it exciting
3. **Requirements** - Education, experience, qualifications needed
4. **Job Type** - Full-time, Part-time, Contract, Freelance, Internship
5. **Experience Level** - Entry, Mid, Senior, or Executive level
6. **Location** - Where is it based? Remote work allowed?
7. **Salary Range** - Optional but helpful for candidates
8. **Required Skills** - Essential technical skills/technologies
9. **Preferred Skills** - Nice-to-have skills
10. **Review & Submit** - Confirms everything before posting

### **Smart Features**

- **Natural Language Processing**: Understands job types, experience levels, salary ranges
- **Context Awareness**: Tracks conversation progress and missing information
- **Flexible Order**: You can provide information in any order
- **Error Handling**: Graceful handling of API connection issues
- **Real-time Feedback**: Shows completion percentage as you talk

## 🗣️ Example Conversation

```
Assistant: Hi there! I'm your AI voice assistant. I'll help you create a comprehensive 
job posting through natural conversation. What position would you like to post today?

You: "I need to hire a senior software engineer" 