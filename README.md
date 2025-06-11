# Brave 10x Hackathon - HireHub AI Talent Matching Platform

🏆 **Brave Hackathon System Track Submission**

An AI-powered talent matching platform that connects job candidates with hiring managers using advanced LLM capabilities. Built as an end-to-end AI product for the Brave Hackathon competition.

## 🚀 Project Overview

HireHub is a full-stack talent matching MVP similar to PeopleGPT by Juicebox or Mercor. The platform leverages AI to intelligently match candidates to job opportunities and provides comprehensive recruiting tools.

### Key Features

- **AI-Powered Matching**: Uses LLMs to generate intelligent job matches and candidate summaries
- **Resume Processing**: Ingests and processes user profiles, resumes, bios, and skills
- **Interactive Interviews**: AI-powered interview agents with voice capabilities
- **Advanced Filtering**: Sophisticated filtering, ranking, and feedback mechanisms for recruiters
- **Real-time Communication**: Integrated voice and video interview capabilities with LiveKit
- **Comprehensive Dashboard**: Modern UI for managing candidates, jobs, and recruitment pipelines

## 🏗️ Architecture

This is a monorepo containing multiple components:

### `/hirehub` - Main Application
- **Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI Integration**: OpenAI GPT models for matching and analysis
- **Database**: Supabase with Prisma ORM
- **Authentication**: Supabase Auth
- **Real-time Features**: LiveKit for voice/video interviews
- **Deployment**: Vercel with Docker support

### `/juicebox-ai` - Competitor Analysis
- Screenshots and analysis of Juicebox PeopleGPT for inspiration
- User flow documentation and feature research

### `/mercor` - Additional Research
- Analysis of Mercor platform features
- Separate tracks for application and recruiter workflows

### `/context` - Project Documentation
- Competition details and requirements
- Step-by-step development guide
- Useful links and resources

## 🛠️ Tech Stack

**Frontend**:
- Next.js 15 with App Router
- React 19 with TypeScript
- Tailwind CSS + Radix UI components
- Framer Motion for animations

**Backend**:
- Supabase (Database + Auth + Storage)
- Prisma ORM
- OpenAI API integration
- LiveKit for real-time communication

**AI/ML**:
- OpenAI GPT-4 for matching algorithms
- Document processing (PDF/DOCX resume parsing)
- Natural language processing for job descriptions

**Deployment**:
- Vercel for frontend
- Docker containers for agents
- GitHub for version control

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd brave-hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cd hirehub
   cp .env.example .env.local
   # Add your Supabase and OpenAI credentials
   ```

4. **Run database migrations**
   ```bash
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
brave-hackathon/
├── hirehub/                 # Main Next.js application
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/            # Utility functions and configurations
│   │   ├── types/          # TypeScript type definitions
│   │   └── hooks/          # Custom React hooks
│   ├── prisma/             # Database schema and migrations
│   ├── public/             # Static assets
│   └── supabase/           # Supabase configuration
├── juicebox-ai/            # Competitor analysis (Juicebox)
├── mercor/                 # Competitor analysis (Mercor)
├── context/                # Project documentation
└── README.md               # This file
```

## 🎯 Core Functionality

### For Job Seekers
- Profile creation with resume upload
- AI-powered job matching
- Interview scheduling and preparation
- Voice-enabled AI interview practice

### For Recruiters
- Candidate discovery and search
- AI-generated candidate summaries
- Advanced filtering and ranking
- Interview management and feedback
- Team collaboration tools

### AI Features
- Resume parsing and skill extraction
- Job-candidate compatibility scoring
- Automated interview question generation
- Real-time interview analysis
- Personalized recommendations

## 📚 Documentation

- [Deployment Guide](hirehub/DEPLOYMENT_GUIDE.md)
- [Prisma Setup](hirehub/README-PRISMA.md)
- [LiveKit Integration](hirehub/LiveKit-Integration-Guide.md)
- [AI Interview Implementation](hirehub/AI_INTERVIEW_IMPLEMENTATION.md)
- [Voice Assistant Setup](hirehub/Voice-Assistant-Setup.md)

## 🏆 Hackathon Submission

This project was built for the **Brave 10x Hackathon - System Track**, focusing on creating an end-to-end AI product that solves real-world hiring challenges.

**Competition Track**: System Track – Build an End-to-End AI Product  
**Problem**: Talent Matching MVP for connecting candidates with hiring managers  
**Timeline**: Hackathon duration  
**Team**: Solo submission

## 🤝 Contributing

This is a hackathon submission project. For questions or feedback, please open an issue.

## 📄 License

This project is part of the Brave Hackathon submission.

---

*Built with ❤️ for the Brave 10x Hackathon*