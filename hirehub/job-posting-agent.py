from dotenv import load_dotenv
import json
import asyncio
import httpx
from typing import Dict, Any, Optional

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    openai,
    noise_cancellation,
)

load_dotenv()


class JobPostingAssistant(Agent):
    def __init__(self) -> None:
        self.job_data = {
            "title": "",
            "description": "",
            "requirements": "",
            "jobType": "",
            "experienceLevel": "",
            "salaryMin": None,
            "salaryMax": None,
            "location": "",
            "remoteAllowed": False,
            "skillsRequired": [],
            "skillsPreferred": []
        }
        
        self.current_step = "greeting"
        self.conversation_state = "active"
        
        instructions = """You are a helpful AI voice assistant specialized in helping recruiters create comprehensive job postings. Your personality is professional, friendly, and encouraging.

CONVERSATION FLOW:
You'll guide the recruiter through creating a job posting by gathering these details in a natural conversation:

1. Job title - What position are they hiring for?
2. Job description - Role responsibilities, what makes it exciting, company culture fit
3. Requirements - Education, experience, certifications, qualifications needed
4. Job type - Full-time, Part-time, Contract, Freelance, or Internship
5. Experience level - Entry (0-2 years), Mid (2-5 years), Senior (5-10 years), or Executive (10+ years)
6. Location - Where is the position based? Is remote work allowed?
7. Salary range - Optional but helpful for attracting candidates
8. Required skills - Essential technical skills and technologies
9. Preferred skills - Nice-to-have skills that would be beneficial
10. Review and confirmation - Read back the complete job posting for approval

COMMUNICATION STYLE:
- Be conversational and natural, not robotic
- Ask follow-up questions to get comprehensive information
- Provide encouraging feedback ("That sounds like an exciting opportunity!")
- If something is unclear, ask for clarification
- Keep responses concise but thorough
- Use examples to help guide their thinking

IMPORTANT NOTES:
- After gathering all information, summarize the complete job posting for their review
- Ask for explicit confirmation before proceeding with submission
- Be flexible with the order - if they provide information out of sequence, acknowledge it and continue naturally
- If they want to go back and change something, be accommodating

Start by greeting them warmly and asking what position they'd like to create a job posting for."""

        super().__init__(instructions=instructions)

    def get_completion_percentage(self) -> int:
        """Calculate how complete the job posting is"""
        total_fields = 9  # Core required fields
        completed_fields = 0
        
        if self.job_data["title"]: completed_fields += 1
        if self.job_data["description"]: completed_fields += 1
        if self.job_data["requirements"]: completed_fields += 1
        if self.job_data["jobType"]: completed_fields += 1
        if self.job_data["experienceLevel"]: completed_fields += 1
        if self.job_data["location"]: completed_fields += 1
        if self.job_data["skillsRequired"]: completed_fields += 1
        if self.job_data["skillsPreferred"]: completed_fields += 1
        if self.job_data["salaryMin"] or self.job_data["salaryMax"]: completed_fields += 1
        
        return int((completed_fields / total_fields) * 100)

    def format_job_summary(self) -> str:
        """Format the complete job posting for review"""
        skills_req = ", ".join(self.job_data["skillsRequired"]) if self.job_data["skillsRequired"] else "Not specified"
        skills_pref = ", ".join(self.job_data["skillsPreferred"]) if self.job_data["skillsPreferred"] else "Not specified"
        
        salary_range = ""
        if self.job_data["salaryMin"] and self.job_data["salaryMax"]:
            salary_range = f"${self.job_data['salaryMin']:,} - ${self.job_data['salaryMax']:,} per year"
        elif self.job_data["salaryMin"]:
            salary_range = f"Starting at ${self.job_data['salaryMin']:,} per year"
        else:
            salary_range = "Not specified"
            
        remote_text = "Yes" if self.job_data["remoteAllowed"] else "No"
        
        return f"""Here's your complete job posting:

**Position:** {self.job_data['title']}
**Employment Type:** {self.job_data['jobType'].replace('_', '-') if self.job_data['jobType'] else 'Not specified'}
**Experience Level:** {self.job_data['experienceLevel'] or 'Not specified'}
**Location:** {self.job_data['location'] or 'Not specified'}
**Remote Work Allowed:** {remote_text}
**Salary Range:** {salary_range}

**Job Description:**
{self.job_data['description'] or 'Not provided'}

**Requirements:**
{self.job_data['requirements'] or 'Not provided'}

**Required Skills:** {skills_req}
**Preferred Skills:** {skills_pref}

Does this look correct? Would you like to make any changes, or shall I submit this job posting?"""

    async def extract_job_info(self, text: str) -> Dict[str, Any]:
        """Extract job information from the conversation using pattern matching and keywords"""
        text_lower = text.lower()
        extracted = {}
        
        # Job type detection
        job_type_patterns = {
            "full": "Full_time",
            "full-time": "Full_time", 
            "full time": "Full_time",
            "part": "Part_time",
            "part-time": "Part_time",
            "part time": "Part_time",
            "contract": "Contractor",
            "contractor": "Contractor",
            "freelance": "Freelance",
            "intern": "Internship",
            "internship": "Internship"
        }
        
        for pattern, job_type in job_type_patterns.items():
            if pattern in text_lower:
                extracted["jobType"] = job_type
                break
        
        # Experience level detection
        exp_patterns = {
            "entry": "Entry",
            "junior": "Entry",
            "beginner": "Entry",
            "new grad": "Entry",
            "graduate": "Entry",
            "mid": "Mid",
            "middle": "Mid",
            "intermediate": "Mid",
            "senior": "Senior",
            "sr": "Senior",
            "lead": "Senior",
            "executive": "Executive",
            "principal": "Executive",
            "director": "Executive",
            "vp": "Executive",
            "c-level": "Executive"
        }
        
        for pattern, level in exp_patterns.items():
            if pattern in text_lower:
                extracted["experienceLevel"] = level
                break
        
        # Remote work detection
        remote_keywords = ["remote", "anywhere", "work from home", "wfh", "distributed", "virtual"]
        if any(keyword in text_lower for keyword in remote_keywords):
            extracted["remoteAllowed"] = True
        
        # Salary extraction (basic pattern matching)
        import re
        salary_patterns = [
            r'(\d+)k?\s*(?:to|-)\s*(\d+)k?',  # "120k to 150k" or "120-150"
            r'\$(\d+),?(\d+)?\s*(?:to|-)\s*\$?(\d+),?(\d+)?',  # "$120,000 to $150,000"
            r'(\d+)\s*thousand',  # "120 thousand"
        ]
        
        for pattern in salary_patterns:
            matches = re.findall(pattern, text_lower.replace(',', ''))
            if matches:
                match = matches[0]
                if len(match) >= 2 and match[0] and match[1]:
                    try:
                        min_sal = int(match[0]) * (1000 if 'k' in text_lower or 'thousand' in text_lower else 1)
                        max_sal = int(match[1]) * (1000 if 'k' in text_lower or 'thousand' in text_lower else 1)
                        extracted["salaryMin"] = min_sal
                        extracted["salaryMax"] = max_sal
                    except (ValueError, IndexError):
                        pass
                break
        
        return extracted

    async def update_job_data(self, extracted_info: Dict[str, Any]) -> None:
        """Update job data with extracted information"""
        for key, value in extracted_info.items():
            if value and key in self.job_data:
                self.job_data[key] = value

    async def submit_job_posting(self) -> Dict[str, Any]:
        """Submit the job posting to the API"""
        try:
            # Update the API URL to match your Next.js app
            api_url = "http://localhost:3000/api/jobs"  # Adjust port if needed
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    api_url,
                    json=self.job_data,
                    headers={"Content-Type": "application/json"},
                    timeout=30.0
                )
                
                if response.status_code == 201:
                    job_data = response.json()
                    return {"success": True, "job": job_data}
                else:
                    error_text = response.text
                    return {"success": False, "error": f"API error {response.status_code}: {error_text}"}
                    
        except httpx.TimeoutException:
            return {"success": False, "error": "Request timed out. Please try again."}
        except httpx.ConnectError:
            return {"success": False, "error": "Could not connect to the job posting service. Please ensure the web app is running."}
        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    async def process_conversation(self, text: str) -> str:
        """Process the user's input and determine the next response"""
        # Extract any job information from the conversation
        extracted_info = await self.extract_job_info(text)
        await self.update_job_data(extracted_info)
        
        # Check if they're asking for a review or want to submit
        text_lower = text.lower()
        
        if any(phrase in text_lower for phrase in ["review", "summary", "read it back", "what do we have", "looks good", "submit", "post it", "create it"]):
            completion = self.get_completion_percentage()
            
            if completion >= 70:  # Most fields completed
                return self.format_job_summary()
            else:
                missing_fields = []
                if not self.job_data["title"]: missing_fields.append("job title")
                if not self.job_data["description"]: missing_fields.append("job description")
                if not self.job_data["requirements"]: missing_fields.append("requirements")
                if not self.job_data["jobType"]: missing_fields.append("job type")
                
                return f"We're about {completion}% complete. We still need to gather: {', '.join(missing_fields)}. Let's continue with those details."
        
        # Check for explicit confirmation to submit
        if any(phrase in text_lower for phrase in ["yes, submit", "yes submit", "looks perfect", "submit it", "post the job", "create the job", "yes, that's correct"]):
            if self.get_completion_percentage() >= 70:
                result = await self.submit_job_posting()
                
                if result["success"]:
                    return "Excellent! Your job posting has been successfully created and is now live. Candidates can start applying right away. You can view and manage your posting in the recruiter dashboard. Is there anything else I can help you with?"
                else:
                    return f"I encountered an issue submitting your job posting: {result['error']}. Would you like me to try again, or would you prefer to make any changes first?"
            else:
                return "I'd like to make sure we have all the essential information before submitting. Let's fill in a few more details first."
        
        # If they want to make changes
        if any(phrase in text_lower for phrase in ["change", "update", "modify", "edit", "different"]):
            return "Of course! What would you like to change? You can say something like 'change the title' or 'update the salary range' and I'll help you modify it."
        
        # Continue the natural conversation flow
        return ""  # Let the realtime model handle the natural conversation


async def entrypoint(ctx: agents.JobContext):
    assistant = JobPostingAssistant()
    
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(
            voice="alloy",  # Professional, clear voice for business context
            temperature=0.7,  # Balanced creativity and consistency
        )
    )

    await session.start(
        room=ctx.room,
        agent=assistant,
        room_input_options=RoomInputOptions(
            # Enhanced noise cancellation for professional conversations
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await ctx.connect()

    # Flag to track if we've given the initial greeting
    initial_greeting_given = False

    # Handle participant joining - give initial greeting when user joins
    @ctx.room.on("participant_connected")
    async def on_participant_connected(participant):
        nonlocal initial_greeting_given
        
        # Only greet human participants (not the agent itself)
        if not participant.identity.startswith("agent-") and not initial_greeting_given:
            print(f"👋 Participant joined: {participant.identity}")
            initial_greeting_given = True
            
            # Give a brief delay to ensure audio tracks are set up
            await asyncio.sleep(1)
            
            # Start the conversation with a warm greeting
            await session.generate_reply(
                instructions="Greet the recruiter warmly and ask what job position they'd like to create a posting for. Be enthusiastic and professional. Start with something like 'Hi there! I'm your AI voice assistant.'"
            )

    # Set up conversation processing
    @session.on("user_speech_committed")
    async def on_user_speech(text: str):
        """Handle user speech and maintain conversation flow"""
        print(f"👤 Recruiter: {text}")
        
        # Process the conversation and extract job information
        response_context = await assistant.process_conversation(text)
        
        if response_context:
            # If we have a specific response (like job summary), use it
            await session.generate_reply(
                instructions=f"Respond with this specific content: {response_context}"
            )
        else:
            # Let the realtime model continue naturally
            completion = assistant.get_completion_percentage()
            
            context_instructions = f"""Continue the conversation naturally. 
            
Current job posting progress: {completion}% complete.

Current job data collected:
- Title: {assistant.job_data['title'] or 'Not provided'}
- Description: {'✓' if assistant.job_data['description'] else '✗'}
- Requirements: {'✓' if assistant.job_data['requirements'] else '✗'}
- Job Type: {assistant.job_data['jobType'] or 'Not provided'}
- Experience Level: {assistant.job_data['experienceLevel'] or 'Not provided'}
- Location: {assistant.job_data['location'] or 'Not provided'}
- Skills: {len(assistant.job_data['skillsRequired'])} required, {len(assistant.job_data['skillsPreferred'])} preferred

Guide the conversation naturally to gather missing information. Be encouraging and ask follow-up questions."""

            await session.generate_reply(instructions=context_instructions)

    print("🎤 Job Posting Voice Assistant is ready!")
    print("📝 I'll help you create a comprehensive job posting through natural conversation.")
    print("💼 Waiting for participants to join...")


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint)) 