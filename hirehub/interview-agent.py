import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional

from dotenv import load_dotenv

from livekit import rtc
from livekit.agents import Agent, AgentSession, JobContext, JobRequest, RoomIO, WorkerOptions, cli
from livekit.agents.llm import ChatContext, ChatMessage, StopResponse
from livekit.plugins import cartesia, deepgram, openai

logger = logging.getLogger("interview-agent")
logger.setLevel(logging.INFO)

load_dotenv()

class InterviewAgent(Agent):
    def __init__(self, job_data: Dict, resume_data: Dict) -> None:
        self.job_data = job_data
        self.resume_data = resume_data
        self.questions = self._generate_interview_questions()
        self.current_question_index = 0
        self.interview_transcript = []
        self.interview_started = False
        self.interview_completed = False
        
        # Create personalized instructions based on job and resume
        instructions = self._create_personalized_instructions()
        
        super().__init__(
            instructions=instructions,
            stt=deepgram.STT(),
            llm=openai.LLM(model="gpt-4o-mini"),
            tts=cartesia.TTS(),
        )

    def _create_personalized_instructions(self) -> str:
        job_title = self.job_data.get('title', 'this position')
        company_name = self.job_data.get('company', {}).get('name', 'our company')
        candidate_name = self.resume_data.get('name', 'the candidate')
        skills = ', '.join(self.resume_data.get('skills', [])[:5])
        
        return f"""You are an AI interviewer conducting a professional job interview for the {job_title} position at {company_name}.

CANDIDATE CONTEXT:
- Name: {candidate_name}
- Key Skills: {skills}
- Experience: {self.resume_data.get('experience', 'Not specified')}

INTERVIEW GUIDELINES:
1. Be professional, friendly, and engaging
2. Ask one question at a time and wait for the candidate's response
3. Ask follow-up questions based on their answers
4. Keep responses concise and focused
5. Evaluate both technical skills and cultural fit
6. The interview should last 5-10 minutes total

CURRENT FOCUS:
You're conducting a structured interview to assess the candidate's suitability for the {job_title} role. Ask meaningful questions that help evaluate their skills, experience, and fit for the position.

Remember: You are the interviewer, not the candidate. Ask questions and listen to responses."""

    def _generate_interview_questions(self) -> List[Dict]:
        """Generate personalized interview questions based on job and resume data"""
        job_title = self.job_data.get('title', 'this position')
        company_name = self.job_data.get('company', {}).get('name', 'our company')
        required_skills = self.job_data.get('skillsRequired', [])
        candidate_skills = self.resume_data.get('skills', [])
        
        # Find overlapping skills for targeted questions
        overlapping_skills = list(set(required_skills) & set(candidate_skills))
        primary_skill = overlapping_skills[0] if overlapping_skills else (candidate_skills[0] if candidate_skills else 'your technical skills')
        
        questions = [
            {
                "id": "intro",
                "question": f"Hello! Welcome to your interview for the {job_title} position at {company_name}. To start, could you please introduce yourself and tell me why you're interested in this role?",
                "category": "introduction",
                "expected_duration": 60
            },
            {
                "id": "technical",
                "question": f"I see you have experience with {primary_skill}. Can you walk me through a specific project where you used {primary_skill} and describe the challenges you faced?",
                "category": "technical",
                "expected_duration": 90
            },
            {
                "id": "experience",
                "question": f"How do you think your background and experience align with what we're looking for in this {job_title} role?",
                "category": "experience", 
                "expected_duration": 75
            },
            {
                "id": "problem_solving",
                "question": "Describe a time when you had to solve a difficult technical problem. What was your approach and what did you learn from it?",
                "category": "problem_solving",
                "expected_duration": 90
            },
            {
                "id": "teamwork",
                "question": f"At {company_name}, collaboration is important. Can you tell me about a time when you worked effectively with a team to achieve a goal?",
                "category": "behavioral",
                "expected_duration": 75
            },
            {
                "id": "goals",
                "question": "Where do you see your career heading in the next few years, and how does this position fit into those goals?",
                "category": "career_goals",
                "expected_duration": 60
            }
        ]
        
        return questions

    async def on_user_turn_completed(self, turn_ctx: ChatContext, new_message: ChatMessage) -> None:
        """Called when user completes a turn"""
        if not new_message.text_content:
            logger.info("Ignoring empty user turn")
            raise StopResponse()
        
        # Record the user's response
        self.interview_transcript.append({
            "timestamp": datetime.now().isoformat(),
            "speaker": "candidate",
            "content": new_message.text_content,
            "question_id": self.questions[self.current_question_index]["id"] if self.current_question_index < len(self.questions) else None
        })
        
        logger.info(f"Candidate response recorded: {new_message.text_content[:100]}...")

    async def on_agent_turn_completed(self, turn_ctx: ChatContext, new_message: ChatMessage) -> None:
        """Called when agent completes a turn"""
        if new_message.text_content:
            # Record the interviewer's question/response
            self.interview_transcript.append({
                "timestamp": datetime.now().isoformat(),
                "speaker": "interviewer",
                "content": new_message.text_content,
                "question_id": self.questions[self.current_question_index]["id"] if self.current_question_index < len(self.questions) else None
            })
            
            logger.info(f"Interviewer message recorded: {new_message.text_content[:100]}...")

    def get_current_question(self) -> Optional[Dict]:
        """Get the current question"""
        if self.current_question_index < len(self.questions):
            return self.questions[self.current_question_index]
        return None

    def advance_to_next_question(self):
        """Move to the next question"""
        self.current_question_index += 1

    def get_interview_progress(self) -> Dict:
        """Get current interview progress"""
        return {
            "current_question": self.current_question_index + 1,
            "total_questions": len(self.questions),
            "progress_percentage": min(100, (self.current_question_index / len(self.questions)) * 100),
            "completed": self.current_question_index >= len(self.questions)
        }

    def get_transcript(self) -> List[Dict]:
        """Get the full interview transcript"""
        return self.interview_transcript


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the interview agent"""
    await ctx.connect()
    
    logger.info(f"Interview agent starting for room: {ctx.room.name}")
    
    # Get job and resume data from room metadata
    room_metadata = json.loads(ctx.room.metadata or '{}')
    job_data = room_metadata.get('job_data', {})
    resume_data = room_metadata.get('resume_data', {})
    
    logger.info(f"Job data: {job_data.get('title', 'Unknown')}")
    logger.info(f"Candidate: {resume_data.get('name', 'Unknown')}")
    
    # Create agent session with manual turn detection for controlled interview flow
    session = AgentSession(turn_detection="manual")
    room_io = RoomIO(session, room=ctx.room)
    await room_io.start()
    
    # Create the interview agent
    agent = InterviewAgent(job_data=job_data, resume_data=resume_data)
    await session.start(agent=agent)
    
    # Start with audio input disabled - will be enabled when interview begins
    session.input.set_audio_enabled(False)
    
    @ctx.room.local_participant.register_rpc_method("start_interview")
    async def start_interview(data: rtc.RpcInvocationData):
        """Start the interview process"""
        logger.info("Starting interview...")
        
        # Set the specific participant we're interviewing
        room_io.set_participant(data.caller_identity)
        
        # Enable audio input
        session.input.set_audio_enabled(True)
        agent.interview_started = True
        
        # Ask the first question
        current_question = agent.get_current_question()
        if current_question:
            # Send the question as an agent message
            await session.llm.agenerate(
                ChatContext([
                    ChatMessage(role="system", content=f"Ask this exact question: {current_question['question']}")
                ])
            )
        
        return json.dumps({"status": "started", "question": current_question})

    @ctx.room.local_participant.register_rpc_method("next_question")
    async def next_question(data: rtc.RpcInvocationData):
        """Move to the next interview question"""
        logger.info("Moving to next question...")
        
        agent.advance_to_next_question()
        current_question = agent.get_current_question()
        
        if current_question:
            # Ask the next question
            await session.llm.agenerate(
                ChatContext([
                    ChatMessage(role="system", content=f"Ask this exact question: {current_question['question']}")
                ])
            )
            return json.dumps({"status": "next_question", "question": current_question})
        else:
            # Interview completed
            agent.interview_completed = True
            session.input.set_audio_enabled(False)
            
            # Send completion message
            await session.llm.agenerate(
                ChatContext([
                    ChatMessage(role="system", content="Thank the candidate for their time and let them know the interview is complete. Keep it brief and professional.")
                ])
            )
            
            return json.dumps({"status": "completed", "transcript": agent.get_transcript()})

    @ctx.room.local_participant.register_rpc_method("end_interview")
    async def end_interview(data: rtc.RpcInvocationData):
        """End the interview and get transcript"""
        logger.info("Ending interview...")
        
        session.input.set_audio_enabled(False)
        agent.interview_completed = True
        
        # Save transcript to database or return it
        transcript = agent.get_transcript()
        
        return json.dumps({
            "status": "ended",
            "transcript": transcript,
            "progress": agent.get_interview_progress()
        })

    @ctx.room.local_participant.register_rpc_method("get_progress")
    async def get_progress(data: rtc.RpcInvocationData):
        """Get current interview progress"""
        progress = agent.get_interview_progress()
        return json.dumps(progress)

    @ctx.room.local_participant.register_rpc_method("get_transcript")
    async def get_transcript(data: rtc.RpcInvocationData):
        """Get current transcript"""
        transcript = agent.get_transcript()
        return json.dumps({"transcript": transcript})

    # Wait for the interview to complete
    while not agent.interview_completed:
        await asyncio.sleep(1)
    
    logger.info("Interview completed, shutting down agent...")


async def handle_request(request: JobRequest) -> None:
    """Handle incoming job requests"""
    logger.info(f"Handling interview request for room: {request.room.name}")
    
    await request.accept(
        identity="interview-agent",
        attributes={
            "interview-agent": "1",
            "capabilities": "voice,transcript,questions"
        }
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(
        entrypoint_fnc=entrypoint,
        request_fnc=handle_request
    ))
