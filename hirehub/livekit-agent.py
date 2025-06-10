#!/usr/bin/env python3

"""
LiveKit AI Interview Agent

This agent conducts technical interviews using OpenAI's GPT models
and provides real-time voice interaction through LiveKit.

To run:
1. Install dependencies: pip install livekit-agents openai
2. Set environment variables: LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_WS_URL, OPENAI_API_KEY
3. Run: python livekit-agent.py
"""

import asyncio
import os
import json
import logging
from typing import Dict, List, Optional

from livekit import api
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import openai, silero

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InterviewAgent:
    def __init__(self, interview_config: Dict):
        self.config = interview_config
        self.questions_asked = 0
        self.max_questions = 5
        self.interview_transcript = []
        
        # Initialize OpenAI LLM
        self.llm = openai.LLM(
            model="gpt-4",
            temperature=0.7,
        )
        
        # System prompt for the AI interviewer
        self.system_prompt = f"""You are a professional AI interviewer conducting a {interview_config.get('experience_level', 'mid-level')} interview for a {interview_config.get('job_title', 'Software Engineer')} position at {interview_config.get('company', 'our company')}.

INTERVIEW GUIDELINES:
- Be conversational, warm, and professional
- Ask follow-up questions based on candidate responses
- Evaluate technical skills: {', '.join(interview_config.get('skills_to_evaluate', []))}
- Assess communication, problem-solving, and cultural fit
- Keep questions appropriate for the experience level
- Conduct exactly {self.max_questions} questions over 15-20 minutes
- Be encouraging and help candidates showcase their strengths

CONVERSATION FLOW:
1. Start with a warm greeting and brief introduction
2. Ask the candidate to introduce themselves
3. Explore their relevant experience and technical skills
4. Ask 2-3 behavioral/situational questions
5. Conclude with next steps and thank them

Remember to:
- Listen actively and ask thoughtful follow-ups
- Give candidates time to think and respond
- Be supportive while maintaining professionalism
- Keep responses concise but engaging
- Transition smoothly between topics"""

    async def generate_question(self, conversation_history: List[str]) -> str:
        """Generate the next interview question based on conversation history"""
        
        if self.questions_asked == 0:
            return "Hello! Welcome to your interview today. I'm excited to learn more about you. Could you please start by introducing yourself and telling me a bit about your background in software development?"
        
        # Prepare context for question generation
        context = f"""
Previous conversation:
{chr(10).join(conversation_history[-6:])}  # Last 3 exchanges

This is question {self.questions_asked + 1} of {self.max_questions}.
Generate an appropriate follow-up question that builds on their responses.
"""
        
        prompt = f"{self.system_prompt}\n\n{context}\n\nGenerate the next interview question:"
        
        response = await self.llm.agenerate(prompt)
        return response.choices[0].message.content.strip()

    async def analyze_response(self, question: str, answer: str) -> Dict:
        """Analyze candidate's response for insights"""
        
        analysis_prompt = f"""
Analyze this interview exchange:

Question: {question}
Answer: {answer}

Provide analysis in JSON format:
{{
    "key_points": ["point1", "point2"],
    "technical_skills_mentioned": ["skill1", "skill2"],
    "soft_skills_demonstrated": ["communication", "problem_solving"],
    "confidence_level": "high/medium/low",
    "clarity_score": 1-10,
    "relevance_score": 1-10
}}
"""
        
        try:
            response = await self.llm.agenerate(analysis_prompt)
            return json.loads(response.choices[0].message.content)
        except:
            return {
                "key_points": [],
                "technical_skills_mentioned": [],
                "soft_skills_demonstrated": [],
                "confidence_level": "medium",
                "clarity_score": 5,
                "relevance_score": 5
            }

    async def generate_final_analysis(self) -> Dict:
        """Generate comprehensive final analysis"""
        
        transcript_text = "\n".join(self.interview_transcript)
        
        analysis_prompt = f"""
Based on this complete interview transcript, provide a comprehensive candidate analysis:

{transcript_text}

Provide analysis in JSON format:
{{
    "overall_score": 0-100,
    "technical_skills": [{{"skill": "JavaScript", "proficiency": 0-100}}],
    "soft_skills": [{{"skill": "Communication", "rating": 0-100}}],
    "communication_score": 0-100,
    "experience_match": 0-100,
    "culture_fit": 0-100,
    "strengths": ["strength1", "strength2"],
    "areas_for_improvement": ["area1", "area2"],
    "summary": "Comprehensive assessment summary",
    "recommendation": "strong_hire|hire|maybe|no_hire",
    "interview_duration": 20,
    "response_quality": 0-100,
    "engagement_level": 0-100
}}
"""
        
        try:
            response = await self.llm.agenerate(analysis_prompt)
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Error generating final analysis: {e}")
            return {
                "overall_score": 50,
                "technical_skills": [],
                "soft_skills": [],
                "communication_score": 50,
                "experience_match": 50,
                "culture_fit": 50,
                "strengths": [],
                "areas_for_improvement": [],
                "summary": "Analysis could not be completed",
                "recommendation": "maybe",
                "interview_duration": 20,
                "response_quality": 50,
                "engagement_level": 50
            }

async def entrypoint(ctx: JobContext):
    """Main entrypoint for the LiveKit agent"""
    
    logger.info(f"Starting interview agent for room: {ctx.room.name}")
    
    # Get interview configuration from room metadata or default
    interview_config = {
        "job_title": "Software Engineer",
        "company": "Tech Company",
        "experience_level": "mid-level",
        "skills_to_evaluate": ["JavaScript", "React", "Node.js"],
        "max_duration": 30
    }
    
    # Initialize interview agent
    interview_agent = InterviewAgent(interview_config)
    
    # Create voice assistant with TTS and STT
    assistant = VoiceAssistant(
        vad=silero.VAD.load(),
        stt=openai.STT(),
        llm=openai.LLM(model="gpt-4"),
        tts=openai.TTS(),
        chat_ctx=llm.ChatContext().append(
            role="system", 
            text=interview_agent.system_prompt
        ),
    )
    
    # Start the voice assistant
    assistant.start(ctx.room)
    
    # Handle interview flow
    conversation_history = []
    
    @assistant.on("user_speech_committed")
    async def on_user_speech(user_msg: llm.ChatMessage):
        """Handle when user completes speaking"""
        
        # Record the exchange
        conversation_history.append(f"User: {user_msg.content}")
        interview_agent.interview_transcript.append(f"A: {user_msg.content}")
        
        # Analyze the response
        if len(conversation_history) >= 2:  # Have both question and answer
            last_question = conversation_history[-2].replace("Assistant: ", "")
            analysis = await interview_agent.analyze_response(last_question, user_msg.content)
            
            # Send analysis to frontend via data channel
            await ctx.room.local_participant.publish_data(
                json.dumps({
                    "type": "response_analysis",
                    "analysis": analysis
                }).encode(),
                reliable=True
            )
        
        # Check if interview should continue
        if interview_agent.questions_asked >= interview_agent.max_questions:
            # Complete the interview
            final_analysis = await interview_agent.generate_final_analysis()
            
            # Send final analysis
            await ctx.room.local_participant.publish_data(
                json.dumps({
                    "type": "interview_complete",
                    "analysis": final_analysis,
                    "transcript": "\n".join(interview_agent.interview_transcript)
                }).encode(),
                reliable=True
            )
            
            # Say goodbye
            await assistant.say("Thank you for taking the time to interview with us today. We've completed our conversation and will be in touch soon with next steps. Have a great day!")
            
            # Wait a moment then disconnect
            await asyncio.sleep(3)
            await ctx.room.disconnect()
        else:
            # Generate next question
            next_question = await interview_agent.generate_question(conversation_history)
            conversation_history.append(f"Assistant: {next_question}")
            interview_agent.interview_transcript.append(f"Q: {next_question}")
            interview_agent.questions_asked += 1
            
            # Send transcript update
            await ctx.room.local_participant.publish_data(
                json.dumps({
                    "type": "transcript",
                    "text": next_question,
                    "speaker": "interviewer"
                }).encode(),
                reliable=True
            )
    
    # Wait for the interview to complete
    await assistant.aclose()

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            auto_subscribe=AutoSubscribe.AUDIO_ONLY,
        ),
    ) 