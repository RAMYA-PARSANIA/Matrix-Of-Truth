from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

scam_router = APIRouter()

# In-memory cache for scams (will be replaced with database)
scam_cache = {
    'scams': [],
    'last_updated': None
}

class ScamAlert(BaseModel):
    title: str
    description: str
    url: str
    source: str
    category: str
    severity: str
    warning: str
    fetched_at: str

class ScamResponse(BaseModel):
    scams: List[ScamAlert]
    total: int
    last_updated: Optional[str]

@scam_router.get("/scam-alerts", response_model=ScamResponse)
async def get_scam_alerts():
    """Get latest scam alerts from Firestore 'newest' collection."""
    try:
        from db.database_service import DatabaseService
        
        db_service = DatabaseService()
        
        # Get from Firestore 'newest' collection
        try:
            scams_ref = db_service.db.collection('newest')
            docs = scams_ref.order_by('fetched_at', direction='DESCENDING').limit(30).stream()
            
            scams = []
            for doc in docs:
                scam_data = doc.to_dict()
                scams.append(ScamAlert(**scam_data))
            
            logger.info(f"Retrieved {len(scams)} scam alerts from Firestore 'newest' collection")
            
            return ScamResponse(
                scams=scams,
                total=len(scams),
                last_updated=scams[0].fetched_at if scams else None
            )
                
        except Exception as e:
            logger.error(f"Error fetching from Firestore: {e}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    except Exception as e:
        logger.error(f"Error fetching scam alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@scam_router.post("/scam-alerts/refresh")
async def refresh_scam_alerts():
    """Manually refresh scam alerts and store in Firestore 'newest' collection."""
    try:
        import asyncio
        from fc.scam_fetcher import ScamFetcher
        from db.database_service import DatabaseService
        
        logger.info("Starting scam alerts refresh...")
        
        # Run in thread pool to avoid blocking
        def _fetch_and_store():
            try:
                scam_fetcher = ScamFetcher()
                scams_data = scam_fetcher.fetch_latest_scams()
                
                if not scams_data:
                    logger.warning("No scam data fetched")
                    return None
                
                # Save to Firestore 'newest' collection
                db_service = DatabaseService()
                scams_ref = db_service.db.collection('newest')
                
                # Clear old scam alerts (keep last 7 days)
                from datetime import datetime, timedelta
                cutoff_date = datetime.now() - timedelta(days=7)
                old_docs = scams_ref.where('fetched_at', '<', cutoff_date.isoformat()).stream()
                
                deleted_count = 0
                for doc in old_docs:
                    doc.reference.delete()
                    deleted_count += 1
                
                if deleted_count > 0:
                    logger.info(f"Deleted {deleted_count} old scam alerts")
                
                # Add new scam alerts
                added_count = 0
                for scam in scams_data:
                    # Check if similar scam already exists (avoid duplicates)
                    existing = scams_ref.where('title', '==', scam['title']).limit(1).stream()
                    
                    if not list(existing):
                        scams_ref.add(scam)
                        added_count += 1
                        
                logger.info(f"Successfully added {added_count} new scam alerts to Firestore")
                
                return scams_data
            except Exception as e:
                logger.error(f"Error in fetch_and_store: {e}")
                raise
        
        # Run in executor to avoid blocking
        loop = asyncio.get_event_loop()
        scams_data = await loop.run_in_executor(None, _fetch_and_store)
        
        if not scams_data:
            return {
                "message": "No scam alerts found",
                "total": 0,
                "updated_at": datetime.now().isoformat()
            }
        
        return ScamResponse(
            scams=[ScamAlert(**scam) for scam in scams_data],
            total=len(scams_data),
            last_updated=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error refreshing scam alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))
