// import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const jobId = formData.get('jobId') as string;
//     const userId = formData.get('userId') as string;
//     const transcript = formData.get('transcript') as string;
//     const analysisStr = formData.get('analysis') as string;
//     const embeddingStr = formData.get('embedding') as string;
//     const duration = formData.get('duration') as string;

//     if (!jobId || !userId || !transcript || !analysisStr) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     const analysis = JSON.parse(analysisStr);
//     const embedding = embeddingStr ? JSON.parse(embeddingStr) : null;

//     // Save comprehensive interview record
//     const { data: interviewData, error: dbError } = await supabase
//       .from('interviews')
//       .insert({
//         job_id: jobId,
//         user_id: userId,
//         transcript,
//         analysis,
//         embedding,
//         duration: parseInt(duration) || 0,
//         overall_score: analysis.overall_score || 0,
//         technical_skills: analysis.technical_skills || [],
//         soft_skills: analysis.soft_skills || [],
//         communication_score: analysis.communication_score || 0,
//         experience_match: analysis.experience_match || 0,
//         culture_fit: analysis.culture_fit || 0,
//         recommendation: analysis.recommendation || 'maybe',
//         status: 'completed',
//         created_at: new Date().toISOString()
//       })
//       .select()
//       .single();

//     if (dbError) {
//       console.error('Database error:', dbError);
//       return NextResponse.json(
//         { error: 'Failed to save interview record' },
//         { status: 500 }
//       );
//     }

//     // Update user profile with new skills and experience data
//     const { error: profileError } = await supabase
//       .from('user_profiles')
//       .upsert({
//         user_id: userId,
//         skills: analysis.technical_skills?.map((s: any) => s.skill) || [],
//         communication_score: analysis.communication_score || 0,
//         recent_interview_score: analysis.overall_score || 0,
//         last_interview_date: new Date().toISOString(),
//         interview_count: 1, // This should be incremented
//         updated_at: new Date().toISOString()
//       });

//     if (profileError) {
//       console.error('Profile update error:', profileError);
//       // Don't fail the request if profile update fails
//     }

//     return NextResponse.json({
//       success: true,
//       interviewId: interviewData.id,
//       analysis: analysis,
//       overallScore: analysis.overall_score
//     });

//   } catch (error) {
//     console.error('Error completing interview:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }