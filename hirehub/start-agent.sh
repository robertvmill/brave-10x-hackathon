#!/bin/bash

# Set default environment variables if not provided
export LIVEKIT_URL=${LIVEKIT_URL:-"wss://hirehub-uo31azq1.livekit.cloud"}
export LIVEKIT_API_KEY=${LIVEKIT_API_KEY:-""}
export LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET:-""}
export OPENAI_API_KEY=${OPENAI_API_KEY:-""}
export DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY:-""}
export CARTESIA_API_KEY=${CARTESIA_API_KEY:-""}

# Check required environment variables
if [ -z "$LIVEKIT_API_KEY" ] || [ -z "$LIVEKIT_API_SECRET" ] || [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: Missing required environment variables"
    echo "Please set: LIVEKIT_API_KEY, LIVEKIT_API_SECRET, OPENAI_API_KEY"
    exit 1
fi

echo "Starting HireHub LiveKit Agent..."
echo "LiveKit URL: $LIVEKIT_URL"

# Start the agent
python -m livekit.agents.cli interview-agent.py 