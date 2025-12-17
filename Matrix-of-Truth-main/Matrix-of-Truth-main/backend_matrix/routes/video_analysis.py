from fastapi import APIRouter, UploadFile, File, HTTPException
import google.generativeai as genai
import time
import os

video_router = APIRouter()

@video_router.post("/analyze-video")
async def analyze_video_endpoint(file: UploadFile = File(...)):
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")
            
        # Check if GEMINI_API_KEY is set
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
            
        temp_file_path = f"temp_{file.filename}"
        
        try:
            with open(temp_file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            genai.configure(api_key=api_key)
            video = genai.upload_file(temp_file_path, mime_type="video/mp4")
            
            max_attempts = 30
            attempts = 0
            while video.state != 2 and attempts < max_attempts:
                import time
                time.sleep(0.36)
                video = genai.get_file(video.name)
                attempts += 1
            
            if video.state != 2:
                raise HTTPException(status_code=500, detail="Video processing timed out")
            
            model = genai.GenerativeModel('gemini-2.0-flash')
            prompt = "Analyze the speech in this video and detect if it contains misinformation or bias. First state if the content is real or fake. Then give a short summary regarding the speech. Then Summarize key points."
            response = model.generate_content([prompt, video])
            
            return {"analysis": response.text}
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Error analyzing video: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=str(e))

