from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from routes.news_fetch import news_router
from routes.user_inputs import input_router
import nest_asyncio
nest_asyncio.apply()
import asyncio
from fc.newsfetcher import NewsFetcher
from fc.scam_fetcher import ScamFetcher
import os
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from routes.user_broadcast import router
from routes.video_analysis import video_router
from routes.image_analysis import image_router
from routes.audio_analysis import audio_router
from routes.deepfake_audio import deepfake_audio_router
from routes import video_broadcast
from routes.nlp_analysis import nlp_router
from routes.deepfake_detection import deepfake_router
from routes.scam_alerts import scam_router  

news_fetcher = NewsFetcher()
scam_fetcher = ScamFetcher()

async def fetch_and_broadcast_news():
    try:
        news_data = news_fetcher.process_single_news()
        # Frontend listens to Firestore directly, no need to broadcast via Pusher
            
    except Exception as e:
        print(f"Error in fetch_and_broadcast_news: {e}")

async def fetch_scam_alerts():
    try:
        loop = asyncio.get_running_loop()
        scam_data = await loop.run_in_executor(None, scam_fetcher.process_single_scam)
        # Frontend listens to Firestore directly, no need to broadcast via Pusher
            
    except Exception as e:
        print(f"Error in fetch_and_broadcast_scam: {e}")

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n" + "="*60)
    print("Starting Matrix of Truth Backend Server")
    print("="*60)
    
    # Download models from Cloud Storage if needed
    print("\nChecking model files...")
    try:
        from core.model_loader import ensure_models_available
        ensure_models_available()
    except Exception as e:
        print(f"Warning: Could not download models: {e}")
    
    # Check critical environment variables
    critical_vars = ['GROQ_API_KEY', 'SERPER_API_KEY', 'GEMINI_API_KEY', 'NEWS_API_KEY']
    print("\nEnvironment Variables Check:")
    for var in critical_vars:
        status = "✓ SET" if os.environ.get(var) else "✗ NOT SET"
        print(f"  {var}: {status}")
    
    print("\nInitializing news database...")
    news_docs = news_fetcher.db_service.news_ref.limit(1).get()

    if len(list(news_docs)) == 0:
        print("No news in database. Fetching initial news...")
        news_fetcher.fetch_initial_news()
    else:
        print("News database already initialized.")
    
    print("\nScheduling news fetching job...")
    scheduler.add_job(fetch_and_broadcast_news, 'interval', seconds=300)
    # await fetch_and_broadcast_news()
    
    print("Scheduling scam alerts fetching job (daily)...")
    scheduler.add_job(fetch_scam_alerts, 'interval', seconds=6000)
    # await fetch_scam_alerts()
    
    scheduler.start()
    
    print("\n" + "="*60)
    print("Server is ready! Listening on http://127.0.0.1:8000")
    print("API Documentation: http://127.0.0.1:8000/docs")
    print("="*60 + "\n")
    
    yield
    
    print("\nShutting down server...")
    scheduler.shutdown()
    print("Server stopped.")

app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(news_router, tags=["News"])
app.include_router(input_router, tags=["User Inputs"])
app.include_router(router, tags=["User Broadcast"])
app.include_router(video_router, tags=["Video Analysis"])
app.include_router(image_router, tags=["Image Analysis"])
app.include_router(audio_router, tags=["Audio Analysis"])
app.include_router(deepfake_audio_router, tags=["Audio Detection"])
app.include_router(video_broadcast.router)
app.include_router(nlp_router, prefix="/nlp", tags=["NLP Analysis"])
app.include_router(deepfake_router, prefix="/deepfake", tags=["Deepfake Detection"])
app.include_router(scam_router, tags=["Scam Alerts"]) 
@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
