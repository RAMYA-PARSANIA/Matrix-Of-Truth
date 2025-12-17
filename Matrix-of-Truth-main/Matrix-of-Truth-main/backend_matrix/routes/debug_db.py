from fastapi import APIRouter
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

debug_router = APIRouter()

@debug_router.get("/debug/firebase-collections")
async def get_firebase_collections():
    """Debug endpoint to list all Firebase collections and their document counts."""
    try:
        from db.database_service import DatabaseService
        
        db_service = DatabaseService()
        
        # List all collections
        collections_info = {}
        
        # Check specific collections we know about
        known_collections = ['news', 'factcheck', 'user_broadcast', 'scam_alerts', 'newest']
        
        for collection_name in known_collections:
            try:
                collection_ref = db_service.db.collection(collection_name)
                docs = list(collection_ref.limit(100).stream())
                
                collections_info[collection_name] = {
                    'exists': True,
                    'document_count': len(docs),
                    'sample_doc_ids': [doc.id for doc in docs[:5]]
                }
                
                if len(docs) > 0:
                    # Get first document as sample
                    sample_data = docs[0].to_dict()
                    collections_info[collection_name]['sample_fields'] = list(sample_data.keys())
                    collections_info[collection_name]['sample_data'] = sample_data
                
            except Exception as e:
                collections_info[collection_name] = {
                    'exists': False,
                    'error': str(e)
                }
        
        return {
            'status': 'success',
            'collections': collections_info
        }
        
    except Exception as e:
        logger.error(f"Error fetching Firebase collections: {e}")
        return {
            'status': 'error',
            'message': str(e)
        }

@debug_router.get("/debug/scam-alerts-detail")
async def get_scam_alerts_detail():
    """Get detailed information about scam_alerts collection."""
    try:
        from db.database_service import DatabaseService
        
        db_service = DatabaseService()
        scams_ref = db_service.db.collection('scam_alerts')
        
        # Get all documents
        docs = list(scams_ref.stream())
        
        scam_data = []
        for doc in docs:
            scam_data.append({
                'id': doc.id,
                'data': doc.to_dict()
            })
        
        return {
            'status': 'success',
            'collection': 'scam_alerts',
            'total_documents': len(docs),
            'documents': scam_data
        }
        
    except Exception as e:
        logger.error(f"Error fetching scam alerts: {e}")
        return {
            'status': 'error',
            'message': str(e),
            'collection': 'scam_alerts'
        }

@debug_router.post("/debug/test-scam-fetch")
async def test_scam_fetch():
    """Test fetching scams and show what would be stored."""
    try:
        from fc.scam_fetcher import ScamFetcher
        
        scam_fetcher = ScamFetcher()
        scams = scam_fetcher.fetch_latest_scams()
        
        return {
            'status': 'success',
            'total_scams_fetched': len(scams),
            'scams': scams,
            'note': 'These scams were fetched but NOT stored in database. Use /scam-alerts/refresh to store them.'
        }
        
    except Exception as e:
        logger.error(f"Error testing scam fetch: {e}")
        return {
            'status': 'error',
            'message': str(e)
        }

@debug_router.post("/debug/clear-old-scam-collection")
async def clear_old_scam_collection():
    """ONE-TIME: Clear old 'scam_alerts' collection (use new 'newest' collection instead)."""
    try:
        from db.database_service import DatabaseService
        
        db_service = DatabaseService()
        old_scams_ref = db_service.db.collection('scam_alerts')
        
        # Delete all documents in old collection
        docs = old_scams_ref.stream()
        deleted_count = 0
        
        for doc in docs:
            doc.reference.delete()
            deleted_count += 1
        
        return {
            'status': 'success',
            'message': f'Deleted {deleted_count} documents from old "scam_alerts" collection',
            'note': 'Now using "newest" collection for scam alerts'
        }
        
    except Exception as e:
        logger.error(f"Error clearing old collection: {e}")
        return {
            'status': 'error',
            'message': str(e)
        }
