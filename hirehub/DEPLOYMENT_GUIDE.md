# 🚀 HireHub Deployment Guide

## Overview
HireHub consists of two components:
1. **Frontend** (Next.js) → Vercel 
2. **Backend** (Python LiveKit Agent) → Multiple options

## 🌐 Frontend Deployment (Vercel)

✅ **Already set up!** Your Vercel is connected to GitHub and auto-deploys.

- **Repository**: Connected to your GitHub repo
- **Auto-deploy**: Pushes to `main` branch trigger deployment
- **URL**: `https://hirehub-[hash].vercel.app`

### Environment Variables for Vercel
Set these in your Vercel dashboard:

```bash
# Database
DATABASE_URL=your_supabase_postgres_url

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# LiveKit
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_URL=wss://hirehub-uo31azq1.livekit.cloud
```

## 🐍 Python Agent Deployment

### Option 1: Local + ngrok (Immediate, Free)

**Best for demos and testing:**

1. **Run locally:**
```bash
# In the hirehub directory
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export LIVEKIT_URL="wss://hirehub-uo31azq1.livekit.cloud"
export LIVEKIT_API_KEY="your_livekit_api_key"
export LIVEKIT_API_SECRET="your_livekit_api_secret"
export OPENAI_API_KEY="your_openai_api_key"
export DEEPGRAM_API_KEY="your_deepgram_api_key"
export CARTESIA_API_KEY="your_cartesia_api_key"

# Start the agent
python -m livekit.agents.cli interview-agent.py
```

2. **Expose with ngrok (in another terminal):**
```bash
ngrok http 8080
```

### Option 2: Render.com (Free Tier)

1. **Push code to GitHub**
2. **Connect Render.com to your repo**
3. **Create a Worker service** with these settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m livekit.agents.cli interview-agent.py`
   - **Environment Variables**: Same as above

### Option 3: Railway (Paid, $5/month)

1. **Add payment method to Railway**
2. **Connect GitHub repo**
3. **Deploy as a Worker service**

### Option 4: Fly.io (Paid)

1. **Add payment method to Fly.io**
2. **Deploy using included fly.toml:**
```bash
flyctl deploy
```

## 🔧 Environment Variables for Python Agent

Create a `.env` file:

```bash
# LiveKit Configuration
LIVEKIT_URL=wss://hirehub-uo31azq1.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# AI Services
OPENAI_API_KEY=your_openai_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key  # For speech-to-text
CARTESIA_API_KEY=your_cartesia_api_key  # For text-to-speech

# Optional: Database (if agent needs to store data)
DATABASE_URL=your_database_url
```

## 📝 Quick Start for Testing

1. **Frontend**: Already deployed on Vercel ✅

2. **Backend (Local)**:
```bash
cd hirehub
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set your API keys
export LIVEKIT_URL="wss://hirehub-uo31azq1.livekit.cloud"
export LIVEKIT_API_KEY="your_key"
export LIVEKIT_API_SECRET="your_secret"
export OPENAI_API_KEY="your_key"

# Start the agent
python -m livekit.agents.cli interview-agent.py
```

3. **Access your app**: Visit your Vercel URL and start an interview!

## 🔒 Security Notes

- Never commit API keys to git
- Use environment variables for all secrets
- Set up environment variables in your deployment platform

## 🐛 Troubleshooting

**Agent won't start?**
- Check all environment variables are set
- Verify LiveKit credentials
- Ensure Python 3.11+ is installed

**Interview not connecting?**
- Check LiveKit URL in frontend matches agent
- Verify agent is running and accessible
- Check network connectivity

## 📊 Monitoring

- **Frontend**: Vercel Analytics
- **Backend**: Platform-specific logs (Render, Railway, etc.)
- **LiveKit**: LiveKit Cloud dashboard

---

**Need help?** Check the logs in your deployment platform or run locally first to debug issues. 