# 🧠 Open Source AI Resume Parsing Setup

This resume parser uses **100% open source** tools plus OpenAI for intelligent analysis.

## 🛠️ Tech Stack

- **PDF Parsing**: `pdf-parse` (open source)
- **Word Parsing**: `mammoth` (open source) 
- **AI Analysis**: OpenAI GPT-3.5-turbo (you can replace with local LLM)
- **Custom Logic**: Our own ATS scoring algorithm

## ⚡ Quick Setup

### 1. Get OpenAI API Key
- Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Create an API key (costs ~$0.01 per resume)

### 2. Add Environment Variable
Create `.env.local` in your project root:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Test It!
```bash
npm run dev
```
- Go to `/resume` page
- Upload a PDF or Word resume
- Watch the **real AI extraction** happen!

## 🎯 What It Extracts

- ✅ **Name, Email, Phone** (contact info)
- ✅ **Skills** (technical and soft skills)
- ✅ **Work Experience** (job history summary)
- ✅ **Education** (degrees and schools)
- ✅ **Job Title** (current/recent position)
- ✅ **Location** (address/city)
- ✅ **Professional Summary**
- ✅ **ATS Score** (our custom algorithm)

## 🔄 Replace with Local LLM (Optional)

Want to avoid OpenAI costs? Replace the OpenAI call in `/api/parse-resume/route.ts` with:

### Option 1: Ollama (Free, Local)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download a model
ollama pull llama2

# Replace OpenAI call with Ollama
fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    model: 'llama2',
    prompt: 'Parse this resume...',
    stream: false
  })
})
```

### Option 2: Hugging Face Transformers
```bash
npm install @huggingface/inference

# Use free models from Hugging Face
```

## 📊 ATS Scoring Algorithm

Our custom scoring (in `calculateATSScore`):
- **Basic Info** (60pts): Name, email, phone, experience, education, skills
- **Skills Bonus** (20pts): More skills = higher score
- **Summary Bonus** (10pts): Professional summary present
- **Job Title** (10pts): Clear job title

## 🎨 Customization

- **Modify parsing prompts** in `parseResumeWithAI()`
- **Adjust ATS scoring** in `calculateATSScore()`
- **Add new fields** to the extraction schema
- **Support new file types** (add parsers for other formats)

## 💡 Cost Breakdown

- **PDF/Word Parsing**: Free (open source)
- **OpenAI GPT-3.5**: ~$0.01 per resume
- **Infrastructure**: Your hosting costs

Total: **~$0.01 per resume** vs commercial APIs that charge $0.10-$1.00!

## 🚀 Production Tips

1. **Rate Limiting**: Add rate limits to prevent abuse
2. **File Size Limits**: Already implemented (5MB)
3. **Error Handling**: Comprehensive error handling included
4. **Caching**: Cache results to avoid re-parsing same files
5. **Security**: Validate file types and scan for malware

This gives you **full control** over your resume parsing pipeline! 🎯 