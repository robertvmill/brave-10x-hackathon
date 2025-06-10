import asyncio
import logging
import os
from typing import Annotated

from livekit import agents, rtc
from livekit.agents import JobContext, WorkerOptions, cli, tokenize, tts
from livekit.agents.llm import ChatContext, ChatMessage
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import openai

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class InterviewAgent:
    def __init__(self):
        self.transcript = []
        self.interview_context = {}
        
    def create_interview_prompt(self, context: dict) -> str:
        """Create a dynamic interview prompt based on job context"""
        base_prompt = f"""You are an AI interviewer conducting a professional job interview for the position of {context.get('jobTitle', 'Software Engineer')} at {context.get('company', 'our company')}.

INTERVIEW OBJECTIVES:
- Assess the candidate's technical skills and experience
- Evaluate cultural fit and communication skills
- Understand their motivation and career goals
- Ask follow-up questions based on their responses

INTERVIEW STRUCTURE:
1. Introduction and role overview (2-3 minutes)
2. Technical background questions (10-15 minutes)
3. Behavioral/situational questions (5-10 minutes)
4. Company culture and candidate questions (5 minutes)

SKILLS TO ASSESS: {', '.join(context.get('requiredSkills', []))}
EXPERIENCE LEVEL: {context.get('experienceLevel', 'Mid-level')}

COMMUNICATION GUIDELINES:
- Be professional, friendly, and encouraging
- Ask one question at a time
- Listen actively and ask follow-up questions
- Keep responses concise (30-60 seconds)
- Provide brief positive feedback when appropriate
- Adapt difficulty based on their responses

CURRENT PHASE: Introduction - Start by welcoming the candidate and briefly explaining the interview process.

Remember: You're evaluating both technical competency and soft skills. Create a comfortable environment while gathering comprehensive information about the candidate."""

        return base_prompt

    async def entrypoint(self, ctx: JobContext):
        """Main entry point for the interview agent"""
        logger.info(f"Starting interview agent for room: {ctx.room.name}")
        
        # Wait for participant to join
        await ctx.connect(auto_subscribe=agents.AutoSubscribe.AUDIO_ONLY)
        
        # Get interview context from room metadata
        room_metadata = ctx.room.metadata or "{}"
        try:
            import json
            self.interview_context = json.loads(room_metadata)
        except:
            self.interview_context = {}
            
        logger.info(f"Interview context: {self.interview_context}")
        
        # Create initial context with interview-specific prompt
        initial_ctx = ChatContext().append(
            role="system",
            text=self.create_interview_prompt(self.interview_context),
        )
        
        # Initialize OpenAI Realtime API
        openai_model = openai.realtime.RealtimeModel(
            instructions=self.create_interview_prompt(self.interview_context),
            voice="alloy",  # Professional, clear voice
            temperature=0.7,
            modalities=["text", "audio"],
        )
        
        logger.info("Creating voice assistant with OpenAI Realtime API...")
        
        # Create the voice assistant
        assistant = VoiceAssistant(
            vad=rtc.AudioVAD(),  # Voice Activity Detection
            stt=openai.STT(),    # Speech-to-Text
            llm=openai_model,    # Large Language Model
            tts=openai.TTS(),    # Text-to-Speech
            chat_ctx=initial_ctx,
        )
        
        # Set up event handlers
        @assistant.on("user_speech_committed")
        def on_user_speech_committed(msg: ChatMessage):
            logger.info(f"User said: {msg.content}")
            self.transcript.append(f"Candidate: {msg.content}")
        
        @assistant.on("agent_speech_committed")  
        def on_agent_speech_committed(msg: ChatMessage):
            logger.info(f"Agent said: {msg.content}")
            self.transcript.append(f"Interviewer: {msg.content}")
        
        @assistant.on("function_calls_finished")
        def on_function_calls_finished(called_functions):
            if called_functions:
                logger.info(f"Function calls completed: {len(called_functions)}")
        
        # Start the voice assistant
        assistant.start(ctx.room)
        
        logger.info("🎙️ Voice assistant started! Interview ready to begin.")
        
        # Wait for the interview to complete
        await assistant.aclose()

def prewarm(proc: agents.WorkerProcess):
    """Pre-warm the worker process with necessary models"""
    logger.info("Pre-warming worker process...")
    proc.userdata["openai_models"] = [
        openai.realtime.RealtimeModel(),
    ]

if __name__ == "__main__":
    # Configure CLI options
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=InterviewAgent().entrypoint,
            prewarm_fnc=prewarm,
        ),
    ) 