import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

// Resume parsing function using OpenAI
async function parseResumeWithAI(text: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Cheaper than GPT-4, still very good for this task
        messages: [
          {
            role: 'system',
            content: `You are a resume parsing expert. Extract structured information from the resume text and return a JSON object with these exact fields:
            {
              "name": "Full name",
              "email": "Email address", 
              "phone": "Phone number",
              "skills": ["skill1", "skill2", "skill3"],
              "experience": "Brief summary of work experience",
              "education": "Education background",
              "jobTitle": "Current or most recent job title",
              "location": "Location/address",
              "summary": "Professional summary"
            }
            
            If any field is not found, use null. Extract all technical skills you can find. For experience, provide a concise summary. Return only valid JSON, no additional text.`
          },
          {
            role: 'user',
            content: `Parse this resume:\n\n${text}`
          }
        ],
        temperature: 0.1, // Low temperature for consistent parsing
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const parsedData = JSON.parse(result.choices[0].message.content);
    
    return parsedData;
  } catch (error) {
    console.error('AI parsing error:', error);
    return null;
  }
}

// Calculate ATS score based on completeness and keywords
function calculateATSScore(parsedData: any): number {
  let score = 0;
  const maxScore = 100;
  
  // Basic completeness (60 points)
  if (parsedData.name) score += 10;
  if (parsedData.email) score += 10;
  if (parsedData.phone) score += 10;
  if (parsedData.experience) score += 10;
  if (parsedData.education) score += 10;
  if (parsedData.skills && parsedData.skills.length > 0) score += 10;

  // Skills quantity bonus (20 points)
  if (parsedData.skills) {
    const skillCount = parsedData.skills.length;
    if (skillCount >= 10) score += 20;
    else if (skillCount >= 5) score += 15;
    else if (skillCount >= 3) score += 10;
    else if (skillCount >= 1) score += 5;
  }

  // Professional summary bonus (10 points)
  if (parsedData.summary && parsedData.summary.length > 50) score += 10;

  // Job title clarity (10 points)
  if (parsedData.jobTitle) score += 10;

  return Math.min(score, maxScore);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    
    let extractedText = '';

    // Extract text based on file type
    if (file.type === 'application/pdf') {
      // PDF parsing using pdf-parse (open source)
      try {
        const data = await pdf(fileBuffer);
        extractedText = data.text;
      } catch (error) {
        console.error('PDF parsing error:', error);
        return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 400 });
      }
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.type === 'application/msword') {
      // Word document parsing using mammoth (open source)
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = result.value;
      } catch (error) {
        console.error('Word document parsing error:', error);
        return NextResponse.json({ error: 'Failed to parse Word document' }, { status: 400 });
      }
    } else if (file.type === 'text/plain') {
      // Plain text
      extractedText = new TextDecoder().decode(fileBuffer);
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'No text could be extracted from the file' }, { status: 400 });
    }

    // Parse the extracted text with AI
    const parsedData = await parseResumeWithAI(extractedText);
    
    if (!parsedData) {
      return NextResponse.json({ error: 'Failed to parse resume content' }, { status: 500 });
    }

    // Calculate ATS score
    const atsScore = calculateATSScore(parsedData);

    return NextResponse.json({
      success: true,
      data: {
        extractedText: extractedText.substring(0, 500) + '...', // First 500 chars for debugging
        parsedData,
        atsScore,
        filename: file.name,
        fileSize: file.size,
        fileType: file.type
      }
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during resume parsing' 
    }, { status: 500 });
  }
} 