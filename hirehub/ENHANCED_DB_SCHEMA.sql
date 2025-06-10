-- Enhanced Database Schema for AI Interview System

-- Enable vector extension for embeddings (if using Supabase/PostgreSQL)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enhanced interviews table with comprehensive analysis
CREATE TABLE interviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id text NOT NULL,
  user_id text NOT NULL,
  
  -- Interview content
  transcript text NOT NULL,
  video_url text,
  duration integer DEFAULT 0,
  
  -- AI Analysis
  analysis jsonb, -- Full AI analysis object
  embedding vector(1536), -- OpenAI embeddings for semantic search
  
  -- Scored metrics
  overall_score integer DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  technical_skills jsonb, -- [{"skill": "JavaScript", "proficiency": 85}]
  soft_skills jsonb, -- [{"skill": "Communication", "rating": 90}]
  communication_score integer DEFAULT 0 CHECK (communication_score >= 0 AND communication_score <= 100),
  experience_match integer DEFAULT 0 CHECK (experience_match >= 0 AND experience_match <= 100),
  culture_fit integer DEFAULT 0 CHECK (culture_fit >= 0 AND culture_fit <= 100),
  
  -- Recommendations
  recommendation text CHECK (recommendation IN ('strong_hire', 'hire', 'maybe', 'no_hire')),
  key_strengths text[],
  areas_for_improvement text[],
  
  -- Status and metadata
  status text DEFAULT 'completed' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User profiles for candidate data
CREATE TABLE user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text UNIQUE NOT NULL,
  
  -- Basic info
  full_name text,
  email text,
  location text,
  
  -- Professional info
  current_title text,
  experience_years integer DEFAULT 0,
  skills text[], -- Aggregated from interviews
  
  -- Interview metrics
  interview_count integer DEFAULT 0,
  average_score numeric(5,2) DEFAULT 0,
  recent_interview_score integer DEFAULT 0,
  communication_score integer DEFAULT 0,
  last_interview_date timestamp with time zone,
  
  -- Profile data
  resume_url text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Job requirements for matching
CREATE TABLE job_requirements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id text NOT NULL,
  
  -- Requirements
  required_skills text[] NOT NULL,
  preferred_skills text[],
  experience_level text,
  min_experience_years integer DEFAULT 0,
  
  -- Matching criteria
  min_score_threshold integer DEFAULT 60,
  weight_technical numeric(3,2) DEFAULT 0.4,
  weight_communication numeric(3,2) DEFAULT 0.3,
  weight_culture_fit numeric(3,2) DEFAULT 0.3,
  
  created_at timestamp with time zone DEFAULT now()
);

-- Interview messages for conversation tracking
CREATE TABLE interview_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id uuid REFERENCES interviews(id) ON DELETE CASCADE,
  
  -- Message content
  type text NOT NULL CHECK (type IN ('question', 'answer')),
  content text NOT NULL,
  audio_url text,
  
  -- Analysis for individual responses
  sentiment numeric(3,2), -- 0.0 to 1.0
  confidence numeric(3,2), -- 0.0 to 1.0
  key_points text[],
  skills_mentioned text[],
  
  -- Timing
  sequence_number integer NOT NULL,
  timestamp timestamp with time zone DEFAULT now()
);

-- Candidate search cache for performance
CREATE TABLE candidate_matches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  search_query_hash text NOT NULL,
  user_id text NOT NULL,
  
  -- Match scores
  ai_match_score integer CHECK (ai_match_score >= 0 AND ai_match_score <= 100),
  skill_match_score integer CHECK (skill_match_score >= 0 AND skill_match_score <= 100),
  experience_match_score integer CHECK (experience_match_score >= 0 AND experience_match_score <= 100),
  
  -- Cached data
  match_explanation text,
  cached_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(search_query_hash, user_id)
);

-- Indexes for performance
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interviews_job_id ON interviews(job_id);
CREATE INDEX idx_interviews_overall_score ON interviews(overall_score DESC);
CREATE INDEX idx_interviews_recommendation ON interviews(recommendation);
CREATE INDEX idx_interviews_created_at ON interviews(created_at DESC);

-- Vector similarity index for embeddings
CREATE INDEX ON interviews USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_skills ON user_profiles USING GIN(skills);
CREATE INDEX idx_user_profiles_average_score ON user_profiles(average_score DESC);

CREATE INDEX idx_interview_messages_interview_id ON interview_messages(interview_id);
CREATE INDEX idx_interview_messages_sequence ON interview_messages(interview_id, sequence_number);

-- Row Level Security
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Interviews: Users can view their own, recruiters can view completed interviews
CREATE POLICY "Users can view their own interviews" ON interviews
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own interviews" ON interviews
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Recruiters can view completed interviews" ON interviews
  FOR SELECT USING (
    status = 'completed' 
    AND auth.jwt() ->> 'role' = 'recruiter'
  );

-- User profiles: Own profile + recruiters can view
CREATE POLICY "Users can manage their own profile" ON user_profiles
  FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "Recruiters can view profiles" ON user_profiles
  FOR SELECT USING (auth.jwt() ->> 'role' = 'recruiter');

-- Interview messages: Linked to interview access
CREATE POLICY "Interview messages follow interview access" ON interview_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interviews 
      WHERE interviews.id = interview_messages.interview_id
      AND (
        interviews.user_id = auth.uid()::text 
        OR (interviews.status = 'completed' AND auth.jwt() ->> 'role' = 'recruiter')
      )
    )
  );

-- Vector search function for candidate matching
CREATE OR REPLACE FUNCTION search_candidates_by_embedding(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  user_id text,
  transcript text,
  analysis jsonb,
  overall_score integer,
  technical_skills jsonb,
  communication_score integer,
  recommendation text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT 
    i.id,
    i.user_id,
    i.transcript,
    i.analysis,
    i.overall_score,
    i.technical_skills,
    i.communication_score,
    i.recommendation,
    1 - (i.embedding <=> query_embedding) as similarity
  FROM interviews i
  WHERE 
    i.embedding <=> query_embedding < 1 - match_threshold
    AND i.status = 'completed'
    AND i.overall_score >= 60
  ORDER BY i.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function to update user profile after interview
CREATE OR REPLACE FUNCTION update_user_profile_after_interview()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user profile with latest interview data
  INSERT INTO user_profiles (user_id, interview_count, recent_interview_score, last_interview_date)
  VALUES (NEW.user_id, 1, NEW.overall_score, NEW.created_at)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    interview_count = user_profiles.interview_count + 1,
    recent_interview_score = NEW.overall_score,
    communication_score = GREATEST(user_profiles.communication_score, NEW.communication_score),
    last_interview_date = NEW.created_at,
    average_score = (
      SELECT AVG(overall_score) 
      FROM interviews 
      WHERE user_id = NEW.user_id AND status = 'completed'
    ),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user profile
CREATE TRIGGER update_profile_after_interview
  AFTER INSERT ON interviews
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_user_profile_after_interview();

-- Sample data for testing
INSERT INTO user_profiles (user_id, full_name, email, current_title, experience_years, skills) VALUES
('user1', 'John Doe', 'john@example.com', 'Senior Developer', 5, ARRAY['JavaScript', 'React', 'Node.js']),
('user2', 'Jane Smith', 'jane@example.com', 'Frontend Engineer', 3, ARRAY['React', 'TypeScript', 'CSS']),
('user3', 'Bob Wilson', 'bob@example.com', 'Full Stack Developer', 7, ARRAY['Python', 'Django', 'PostgreSQL']);

-- Example search queries for recruiters:
/*
-- Basic candidate search
SELECT * FROM interviews 
WHERE overall_score >= 80 
AND recommendation IN ('strong_hire', 'hire')
ORDER BY overall_score DESC;

-- Search by skills
SELECT i.*, up.full_name, up.email
FROM interviews i
JOIN user_profiles up ON i.user_id = up.user_id
WHERE i.technical_skills @> '[{"skill": "JavaScript"}]'
AND i.overall_score >= 70;

-- Vector similarity search (requires embeddings)
SELECT * FROM search_candidates_by_embedding(
  '[0.1, 0.2, ...]'::vector, -- Query embedding
  0.7, -- Match threshold
  10   -- Max results
);
*/ 