import { AccessToken } from 'livekit-server-sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { identity, room } = await request.json()

    if (!identity || !room) {
      return NextResponse.json(
        { error: 'Missing identity or room' },
        { status: 400 }
      )
    }

    // Validate environment variables
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      console.error('Missing LiveKit credentials')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    console.log('Generating token for:', { identity, room, apiKey: apiKey.substring(0, 8) + '...' })

    // Create access token with proper options
    const token = new AccessToken(apiKey, apiSecret, { identity })

    // Grant permissions for voice assistant room
    token.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    // Generate the JWT token
    const jwt = await token.toJwt()
    
    console.log('Token generated successfully, length:', jwt.length)

    return NextResponse.json({ 
      token: jwt,
      url: process.env.LIVEKIT_URL || 'wss://hirehub-epnu8ba6.livekit.cloud'
    })

  } catch (error) {
    console.error('Error generating LiveKit token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 