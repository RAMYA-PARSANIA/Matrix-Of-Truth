from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from dotenv import load_dotenv
from datetime import datetime
import uvicorn
import typing_extensions as typing
import httpx

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("EXT_GEMINI_API")
if not API_KEY:
    print("WARNING: EXT_GEMINI_API not found in environment variables")

# Define schemas
class Claim(typing.TypedDict):
    statement: str
    accuracy: str
    explanation: str

class FactCheckAnalysis(typing.TypedDict):
    summary: str
    claims: list[Claim]

class PageData(BaseModel):
    title: str = ""
    content: str = ""
    url: str = ""
    
class TranscriptData(BaseModel):
    transcript: str
    title: str = "Speech Transcript"
    source: str = "Broadcast"

async def call_gemini_raw(prompt: str, tools: list = None, response_schema: dict = None):
    """
    Makes a direct REST API call to Gemini to bypass SDK version issues.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.2,
            "topP": 0.95,
            "topK": 40,
            "maxOutputTokens": 8192,
        }
    }
    
    if tools:
        payload["tools"] = tools
        
    if response_schema:
        payload["generationConfig"]["responseMimeType"] = "application/json"
        payload["generationConfig"]["responseSchema"] = response_schema

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers, timeout=60.0)
            response.raise_for_status()
            data = response.json()
            
            # Extract text from response
            try:
                text = data['candidates'][0]['content']['parts'][0]['text']
                return text
            except (KeyError, IndexError) as e:
                print(f"Error extracting text from response: {data}")
                raise ValueError("Invalid response structure from Gemini API")
                
        except httpx.HTTPStatusError as e:
            print(f"HTTP Error: {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=f"Gemini API Error: {e.response.text}")
        except Exception as e:
            print(f"Request Error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

async def perform_fact_check(content_text: str, context_info: str):
    try:
        # Step 1: Search and Analyze
        print("Step 1: Starting Search and Analysis (Raw API)...")
        
        search_prompt = f"""
        You are a rigorous Fact Checker. Your goal is to verify the accuracy of the following content using Google Search.
        
        CONTEXT: {context_info}
        
        CONTENT TO CHECK:
        {content_text}
        
        INSTRUCTIONS:
        1. You MUST perform Google Searches to verify each claim.
        2. Do NOT say "To be determined". You must determine the accuracy NOW based on search results.
        3. If a claim is true, provide the source.
        4. If a claim is false, explain why and provide the correct information.
        5. If a claim is unverifiable after searching, state that clearly.
        
        OUTPUT FORMAT:
        Provide a detailed analysis listing each claim and its verification status (Accurate/Inaccurate/Unverifiable) with evidence.
        """
        
        # Raw tool config for Google Search - trying camelCase just in case, though snake_case is standard for v1beta
        # The error message said 'google_search', so we stick with that but add the retrieval config if needed
        search_tools = [{"google_search": {}}]
        
        # We need to capture the full response to check for grounding
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": search_prompt}]}],
            "tools": search_tools,
            "generationConfig": {
                "temperature": 0.1, # Lower temperature for more factual responses
                "maxOutputTokens": 8192,
            }
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=60.0)
            response.raise_for_status()
            data = response.json()
            
            # Check for grounding metadata
            candidates = data.get('candidates', [])
            if not candidates:
                raise ValueError("No candidates returned from Gemini")
            
            candidate = candidates[0]
            grounding_metadata = candidate.get('groundingMetadata')
            
            if grounding_metadata:
                print(f"✅ Grounding Metadata Found: {json.dumps(grounding_metadata.get('searchEntryPoint', {}))}")
            else:
                print("⚠️ WARNING: No Grounding Metadata found! The model may not have searched.")
                
            search_response_text = candidate['content']['parts'][0]['text']
            print("Step 1 Complete.")

        # Step 2: Format to JSON
        print("Step 2: Formatting to JSON (Raw API)...")
        
        format_prompt = f"""
        Based on the following fact-checking analysis, extract the summary and claims into a structured JSON object.
        
        ANALYSIS:
        {search_response_text}
        """
        
        # JSON Schema for raw API
        json_schema = {
            "type": "OBJECT",
            "required": ["summary", "claims"],
            "properties": {
                "summary": {"type": "STRING"},
                "claims": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "required": ["statement", "accuracy", "explanation"],
                        "properties": {
                            "statement": {"type": "STRING"},
                            "accuracy": {"type": "STRING"},
                            "explanation": {"type": "STRING"}
                        }
                    }
                }
            }
        }
        
        format_response_text = await call_gemini_raw(format_prompt, response_schema=json_schema)
        print("Step 2 Complete.")
        
        # Parse JSON
        analysis_result = json.loads(format_response_text)
        return analysis_result

    except Exception as e:
        print(f"Error during fact check: {str(e)}")
        raise e

@app.post('/api/fact-check')
async def fact_check(page_data: PageData):
    try:
        print(f"Received fact-check request for: {page_data.title}")
        content_to_analyze = page_data.content[:15000] 
        if len(page_data.content) > 15000:
            content_to_analyze += "... (content truncated)"

        context_info = f"Title: {page_data.title}, URL: {page_data.url}"
        analysis_result = await perform_fact_check(content_to_analyze, context_info)
        
        result = {
            "timestamp": datetime.now().isoformat(),
            "url": page_data.url,
            "title": page_data.title,
            "analysis": analysis_result
        }
        return result
    except Exception as e:
        print(f"Exception in /api/fact-check: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/fact-check-transcript')
async def fact_check_transcript(transcript_data: TranscriptData):
    try:
        print(f"Received transcript fact-check request for: {transcript_data.title}")
        transcript_to_analyze = transcript_data.transcript[:15000]
        if len(transcript_data.transcript) > 15000:
            transcript_to_analyze += "... (content truncated)"
            
        context_info = f"Title: {transcript_data.title}, Source: {transcript_data.source}"
        analysis_result = await perform_fact_check(transcript_to_analyze, context_info)
        
        result = {
            "timestamp": datetime.now().isoformat(),
            "source": transcript_data.source,
            "title": transcript_data.title,
            "analysis": analysis_result
        }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/health')
async def health_check():
    return {"status": "healthy", "service": "fact-checker-api"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting extension backend on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
