# 🔧 Render Environment Variables Setup

## Required Environment Variables for Python Agent

**Create these environment variable groups in Render:**

### Group: `agent`
```bash
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
OPENAI_API_KEY=your_openai_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
CARTESIA_API_KEY=your_cartesia_api_key
```

### Group: `frontend` (if using Render for frontend backup)
```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgres_url
OPENAI_API_KEY=your_openai_api_key
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
```

## 🚀 Quick Setup Steps

1. **Go to Render Dashboard** → **Environment Groups**
2. **Create `agent` group** with the variables above
3. **Deploy the service** - it should now start successfully!

## 🐛 Troubleshooting

**If agent still fails:**
- Check Render logs for specific error messages
- Verify all API keys are valid
- Ensure LiveKit URL is reachable

**Common issues:**
- Missing API keys → Service exits with status 1
- Invalid LiveKit credentials → Connection errors
- Wrong Python version → Import errors 