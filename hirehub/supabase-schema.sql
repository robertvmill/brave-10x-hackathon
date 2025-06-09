-- HireHub Database Schema
-- Created for Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_type AS ENUM ('candidate', 'recruiter');
CREATE TYPE job_type AS ENUM ('Full-time', 'Part-time', 'Contractor', 'Freelance', 'Internship');
CREATE TYPE experience_level AS ENUM ('Entry', 'Mid', 'Senior', 'Executive');
CREATE TYPE application_status AS ENUM ('draft', 'submitted', 'viewed', 'shortlisted', 'interview', 'rejected', 'hired');
CREATE TYPE industry_type AS ENUM ('Technology', 'Healthcare', 'Finance', 'Consulting', 'Startup', 'Education', 'Government', 'Non-profit', 'Other');

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(255),
    industry industry_type,
    size_range VARCHAR(50), -- e.g., "1-10", "11-50", "51-200", "201-500", "500+"
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    user_type user_type NOT NULL,
    company_id UUID REFERENCES companies(id),
    title VARCHAR(255),
    phone_number VARCHAR(20),
    bio TEXT,
    location VARCHAR(255),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    resume_url VARCHAR(255),
    skills TEXT[], -- Array of skills
    experience_level experience_level,
    years_experience INTEGER,
    salary_min INTEGER,
    salary_max INTEGER,
    remote_preference BOOLEAN DEFAULT false,
    profile_completed BOOLEAN DEFAULT false,
    profile_strength INTEGER DEFAULT 0, -- 0-100 percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job opportunities table
CREATE TABLE job_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    company_id UUID REFERENCES companies(id) NOT NULL,
    recruiter_id UUID REFERENCES user_profiles(id) NOT NULL,
    description TEXT,
    requirements TEXT,
    job_type job_type NOT NULL,
    experience_level experience_level,
    salary_min INTEGER,
    salary_max INTEGER,
    location VARCHAR(255),
    remote_allowed BOOLEAN DEFAULT false,
    skills_required TEXT[], -- Array of required skills
    skills_preferred TEXT[], -- Array of preferred skills
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    external_id VARCHAR(255), -- For external job board integrations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User job preferences (for candidates)
CREATE TABLE user_job_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES job_opportunities(id) ON DELETE CASCADE,
    is_interested BOOLEAN DEFAULT true,
    preference_strength INTEGER DEFAULT 1, -- 1-5 scale
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, opportunity_id)
);

-- Applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES user_profiles(id) NOT NULL,
    opportunity_id UUID REFERENCES job_opportunities(id) NOT NULL,
    recruiter_id UUID REFERENCES user_profiles(id) NOT NULL,
    status application_status DEFAULT 'submitted',
    cover_letter TEXT,
    resume_url VARCHAR(255),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT, -- Recruiter notes
    UNIQUE(candidate_id, opportunity_id)
);

-- Saved jobs (bookmarks)
CREATE TABLE saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES job_opportunities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, opportunity_id)
);

-- Profile views (for analytics)
CREATE TABLE profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viewed_profile_id UUID REFERENCES user_profiles(id) NOT NULL,
    viewer_id UUID REFERENCES user_profiles(id),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(50) -- 'search', 'recommendation', 'direct', etc.
);

-- Skills master table (for consistency)
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50), -- 'Programming', 'Design', 'Management', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding progress tracking
CREATE TABLE onboarding_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
    step_1_completed BOOLEAN DEFAULT false, -- User type selection
    step_2_completed BOOLEAN DEFAULT false, -- Job preferences
    step_3_completed BOOLEAN DEFAULT false, -- Profile completion
    step_4_completed BOOLEAN DEFAULT false, -- Resume upload
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX idx_job_opportunities_company_id ON job_opportunities(company_id);
CREATE INDEX idx_job_opportunities_recruiter_id ON job_opportunities(recruiter_id);
CREATE INDEX idx_job_opportunities_is_active ON job_opportunities(is_active);
CREATE INDEX idx_job_opportunities_job_type ON job_opportunities(job_type);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_opportunity_id ON applications(opportunity_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_user_job_preferences_user_id ON user_job_preferences(user_id);
CREATE INDEX idx_profile_views_viewed_profile_id ON profile_views(viewed_profile_id);
CREATE INDEX idx_profile_views_viewer_id ON profile_views(viewer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_opportunities_updated_at BEFORE UPDATE ON job_opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_progress_updated_at BEFORE UPDATE ON onboarding_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_job_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Recruiters can view candidate profiles" ON user_profiles FOR SELECT USING (
    EXISTS(SELECT 1 FROM user_profiles WHERE id = auth.uid() AND user_type = 'recruiter')
);

-- Companies policies
CREATE POLICY "Everyone can view companies" ON companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Recruiters can manage their company" ON companies FOR ALL USING (
    EXISTS(SELECT 1 FROM user_profiles WHERE id = auth.uid() AND company_id = companies.id AND user_type = 'recruiter')
);

-- Job opportunities policies
CREATE POLICY "Everyone can view active jobs" ON job_opportunities FOR SELECT USING (is_active = true);
CREATE POLICY "Recruiters can manage their jobs" ON job_opportunities FOR ALL USING (auth.uid() = recruiter_id);

-- User job preferences policies
CREATE POLICY "Users can manage their own preferences" ON user_job_preferences FOR ALL USING (auth.uid() = user_id);

-- Applications policies
CREATE POLICY "Candidates can view their applications" ON applications FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Recruiters can view applications for their jobs" ON applications FOR SELECT USING (auth.uid() = recruiter_id);
CREATE POLICY "Candidates can create applications" ON applications FOR INSERT WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Recruiters can update application status" ON applications FOR UPDATE USING (auth.uid() = recruiter_id);

-- Saved jobs policies
CREATE POLICY "Users can manage their saved jobs" ON saved_jobs FOR ALL USING (auth.uid() = user_id);

-- Profile views policies
CREATE POLICY "Users can view their profile analytics" ON profile_views FOR SELECT USING (auth.uid() = viewed_profile_id);
CREATE POLICY "Authenticated users can create profile views" ON profile_views FOR INSERT WITH CHECK (auth.uid() = viewer_id OR viewer_id IS NULL);

-- Skills policies
CREATE POLICY "Everyone can view skills" ON skills FOR SELECT TO authenticated USING (true);

-- Onboarding progress policies
CREATE POLICY "Users can manage their onboarding progress" ON onboarding_progress FOR ALL USING (auth.uid() = user_id);

-- Insert some initial data

-- Sample companies
INSERT INTO companies (name, description, industry, size_range, location) VALUES
('Leading Tech Consultancy', 'A premier technology consulting firm specializing in AI and digital transformation', 'Technology', '501+', 'San Francisco, CA'),
('Healthcare Technology Startup', 'Innovative healthcare technology company revolutionizing patient care', 'Healthcare', '11-50', 'Boston, MA'),
('Major Financial Services Firm', 'Global financial services leader with cutting-edge data analytics', 'Finance', '501+', 'New York, NY'),
('Fast-Growing Fintech Company', 'Disrupting traditional banking with AI-powered financial solutions', 'Finance', '51-200', 'Austin, TX'),
('Global Management Consulting Firm', 'World-renowned consulting firm helping organizations transform digitally', 'Consulting', '501+', 'London, UK'),
('Emerging AI Startup', 'Next-generation AI platform for enterprise automation', 'Startup', '1-10', 'Palo Alto, CA');

-- Sample skills
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Programming'),
('Python', 'Programming'),
('React', 'Programming'),
('Node.js', 'Programming'),
('TypeScript', 'Programming'),
('SQL', 'Programming'),
('Machine Learning', 'AI/ML'),
('Data Analysis', 'Analytics'),
('Project Management', 'Management'),
('UI/UX Design', 'Design'),
('Marketing', 'Marketing'),
('Sales', 'Sales'),
('Leadership', 'Management'),
('Communication', 'Soft Skills'),
('Problem Solving', 'Soft Skills');

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, user_type)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'candidate')::user_type
    );
    
    INSERT INTO public.onboarding_progress (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 