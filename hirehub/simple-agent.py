#!/usr/bin/env python3
"""
Simple LiveKit Interview Agent Setup Test

This checks if your environment is properly configured for LiveKit interviews.
"""

import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_setup():
    """
    Test if the LiveKit setup is ready for interviews.
    """
    
    print("🚀 Testing LiveKit Interview Agent Setup...\n")
    
    # Check if environment variables are set
    required_vars = {
        'LIVEKIT_API_KEY': 'LiveKit API Key',
        'LIVEKIT_API_SECRET': 'LiveKit API Secret', 
        'LIVEKIT_URL': 'LiveKit WebSocket URL',
        'OPENAI_API_KEY': 'OpenAI API Key'
    }
    
    missing_vars = []
    
    for var, description in required_vars.items():
        value = os.getenv(var)
        if value:
            if 'secret' in var.lower() or 'key' in var.lower():
                # Mask sensitive values
                display_value = value[:8] + "..." if len(value) > 8 else "***"
            else:
                display_value = value
            print(f"✅ {description}: {display_value}")
        else:
            print(f"❌ {description}: NOT SET")
            missing_vars.append(var)
    
    if missing_vars:
        print(f"\n❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please add these to your .env.local file")
        return False
    
    print("\n✅ All environment variables are configured!")
    
    # Test Next.js connection
    print("\n🔗 Testing Next.js application...")
    try:
        import urllib.request
        response = urllib.request.urlopen('http://localhost:3003/api/jobs')
        if response.getcode() == 200:
            print("✅ Next.js app is running and accessible")
        else:
            print("⚠️  Next.js app responded but with issues")
    except Exception as e:
        print("❌ Cannot connect to Next.js app (http://localhost:3003)")
        print("Make sure your app is running with 'npm run dev'")
        return False
    
    return True

if __name__ == "__main__":
    if test_setup():
        print("\n🎉 Setup Complete! Ready for AI Interviews!")
        print("\n📋 To test the system:")
        print("1. Go to http://localhost:3003")
        print("2. Navigate to any job posting")
        print("3. Click 'Start AI Interview'")
        print("4. Complete the interview preparation")
        print("5. Start the live interview")
        
        print("\n🔧 For production LiveKit agent:")
        print("1. Install: pip install -r requirements.txt")
        print("2. Run: python livekit-agent.py")
        
        print("\n💡 Current setup uses simulated agent responses")
        print("   Install full LiveKit agents for real voice AI")
    else:
        print("\n❌ Setup incomplete. Please fix the issues above.") 