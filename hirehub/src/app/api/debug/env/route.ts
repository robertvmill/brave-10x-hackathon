import { NextResponse } from 'next/server'

export async function GET() {
  const envCheck = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY ? 'Set' : 'Missing',
    LIVEKIT_API_KEY: !!process.env.LIVEKIT_API_KEY ? 'Set' : 'Missing', 
    LIVEKIT_API_SECRET: !!process.env.LIVEKIT_API_SECRET ? 'Set' : 'Missing',
    LIVEKIT_URL: process.env.LIVEKIT_URL || 'Missing',
    
    // Show first/last few characters to verify they're not placeholder values
    OPENAI_KEY_FORMAT: process.env.OPENAI_API_KEY ? 
      `${process.env.OPENAI_API_KEY.substring(0, 4)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4)}` : 
      'N/A',
    LIVEKIT_KEY_FORMAT: process.env.LIVEKIT_API_KEY ? 
      `${process.env.LIVEKIT_API_KEY.substring(0, 4)}...${process.env.LIVEKIT_API_KEY.substring(process.env.LIVEKIT_API_KEY.length - 4)}` : 
      'N/A'
  }

  return NextResponse.json(envCheck)
} 