import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CandidateSearchService } from '@/lib/ai-interview';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { 
      jobRequirements, 
      requiredSkills, 
      experienceLevel, 
      minimumScore,
      location,
      limit = 20 
    } = await request.json();

    if (!jobRequirements || !requiredSkills) {
      return NextResponse.json(
        { error: 'Job requirements and skills are required' },
        { status: 400 }
      );
    }

    const searchService = new CandidateSearchService();

    // Step 1: Generate embedding for the search query
    const queryText = `${jobRequirements} ${requiredSkills.join(' ')} ${experienceLevel || ''}`;
    const searchEmbedding = await searchService.generateEmbedding(queryText);

    // Step 2: Find candidates with similar interview embeddings (vector similarity)
    // Note: This requires pgvector extension in PostgreSQL or Supabase vector support
    const { data: candidates, error: searchError } = await supabase.rpc(
      'search_candidates_by_embedding',
      {
        query_embedding: searchEmbedding,
        match_threshold: 0.7,
        match_count: limit * 2 // Get more candidates for filtering
      }
    );

    if (searchError) {
      console.error('Vector search error:', searchError);
      // Fallback to basic search if vector search fails
      const { data: fallbackCandidates, error: fallbackError } = await supabase
        .from('interviews')
        .select(`
          *,
          user_profiles!inner(*)
        `)
        .gte('overall_score', minimumScore || 60)
        .limit(limit);

      if (fallbackError) {
        throw fallbackError;
      }

      return NextResponse.json({
        candidates: fallbackCandidates || [],
        searchMethod: 'fallback'
      });
    }

    // Step 3: Enhanced matching using AI analysis
    const enhancedCandidates = await Promise.all(
      (candidates || []).slice(0, limit).map(async (candidate: any) => {
        // Calculate AI-powered match score
        const matchScore = await searchService.calculateMatch(
          {
            skills: candidate.technical_skills?.map((s: any) => s.skill) || [],
            experience: candidate.user_profiles?.experience_years || 0,
            interview_summary: candidate.analysis?.summary || '',
            communication_score: candidate.communication_score || 0,
            transcript: candidate.transcript
          },
          {
            skills: requiredSkills,
            experience_level: experienceLevel,
            job_requirements: jobRequirements
          }
        );

        return {
          ...candidate,
          aiMatchScore: matchScore,
          // Include relevant interview insights
          keyStrengths: candidate.analysis?.strengths || [],
          skillProficiencies: candidate.technical_skills || [],
          communicationRating: candidate.communication_score || 0,
          overallScore: candidate.overall_score || 0,
          recommendation: candidate.recommendation || 'unknown'
        };
      })
    );

    // Step 4: Sort by AI match score and filter
    const filteredCandidates = enhancedCandidates
      .filter(candidate => 
        candidate.aiMatchScore >= 70 && // High match threshold
        candidate.overallScore >= (minimumScore || 60)
      )
      .sort((a, b) => b.aiMatchScore - a.aiMatchScore);

    // Step 5: Group by skill proficiency for easy filtering
    const skillBreakdown = requiredSkills.map(skill => {
      const candidatesWithSkill = filteredCandidates.filter(candidate =>
        candidate.skillProficiencies.some((s: any) => 
          s.skill.toLowerCase().includes(skill.toLowerCase()) && s.proficiency >= 60
        )
      );

      return {
        skill,
        candidateCount: candidatesWithSkill.length,
        averageProficiency: candidatesWithSkill.reduce((avg, candidate) => {
          const skillData = candidate.skillProficiencies.find((s: any) => 
            s.skill.toLowerCase().includes(skill.toLowerCase())
          );
          return avg + (skillData?.proficiency || 0);
        }, 0) / (candidatesWithSkill.length || 1)
      };
    });

    return NextResponse.json({
      candidates: filteredCandidates,
      searchMethod: 'ai_enhanced',
      summary: {
        totalMatches: filteredCandidates.length,
        averageMatchScore: filteredCandidates.reduce((avg, c) => avg + c.aiMatchScore, 0) / filteredCandidates.length,
        skillBreakdown,
        searchCriteria: {
          jobRequirements,
          requiredSkills,
          experienceLevel,
          minimumScore
        }
      }
    });

  } catch (error) {
    console.error('Error searching candidates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for simple candidate search
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const skills = url.searchParams.get('skills')?.split(',') || [];
    const minScore = parseInt(url.searchParams.get('minScore') || '60');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const { data: candidates, error } = await supabase
      .from('interviews')
      .select(`
        user_id,
        overall_score,
        technical_skills,
        communication_score,
        recommendation,
        created_at,
        analysis,
        user_profiles!inner(
          full_name,
          email,
          location,
          experience_years
        )
      `)
      .gte('overall_score', minScore)
      .eq('status', 'completed')
      .order('overall_score', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      candidates: candidates || [],
      searchMethod: 'basic'
    });

  } catch (error) {
    console.error('Error in basic candidate search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 