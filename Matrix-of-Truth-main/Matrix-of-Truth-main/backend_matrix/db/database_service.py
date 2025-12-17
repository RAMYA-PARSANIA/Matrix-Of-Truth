from firebase_admin import firestore
from typing import Dict, List
from firebase import db

class DatabaseService:
    def __init__(self):
        self.db = db
        self.news_ref = self.db.collection('news')
        self.factcheck_ref = self.db.collection('factcheck')
        self.scams_queue_ref = self.db.collection('scams_queue')
        self.scams_ref = self.db.collection('newest')
    
    def store_news(self, news_list: List[Dict]):
        batch = self.db.batch()
        for news in news_list:
            doc_ref = self.news_ref.document()
            news['processed'] = False
            batch.set(doc_ref, news)
        batch.commit()
        
    def store_factcheck(self, news_id: str, factcheck: Dict):
        self.news_ref.document(news_id).update({'processed': True})

        return self.factcheck_ref.document(news_id).set(factcheck)
        
    def get_unprocessed_news(self):
        query = self.news_ref.where('processed', '==', False).limit(1)
        docs = query.get()
        return next((doc.to_dict() | {'id': doc.id} for doc in docs), None)

    def store_scams_queue(self, scams_list: List[Dict]):
        batch = self.db.batch()
        for scam in scams_list:
            doc_ref = self.scams_queue_ref.document()
            scam['processed'] = False
            batch.set(doc_ref, scam)
        batch.commit()

    def get_unprocessed_scam(self):
        query = self.scams_queue_ref.where('processed', '==', False).limit(1)
        docs = query.get()
        return next((doc.to_dict() | {'id': doc.id} for doc in docs), None)

    def mark_scam_processed(self, scam_id: str, scam_data: Dict):
        self.scams_queue_ref.document(scam_id).update({'processed': True})
        
        # Remove 'processed' and 'id' fields before adding to public collection
        public_data = scam_data.copy()
        public_data.pop('processed', None)
        public_data.pop('id', None)

        # Ensure timestamp exists (migration fix)
        if 'timestamp' not in public_data:
            if 'fetched_at' in public_data:
                public_data['timestamp'] = public_data['fetched_at']
            else:
                from datetime import datetime
                public_data['timestamp'] = datetime.now().isoformat()
        
        # Check for duplicates in 'newest'
        existing = self.scams_ref.where('title', '==', public_data['title']).limit(1).stream()
        if not list(existing):
            return self.scams_ref.add(public_data)
        return None
        
    # def get_all_news_with_factchecks(self):
    #     news_docs = self.news_ref.get()
    #     result = []
    #     for news in news_docs:
    #         news_data = news.to_dict() | {'id': news.id}
    #         factcheck = self.factcheck_ref.document(news.id).get()
    #         news_data['factcheck'] = factcheck.to_dict() if factcheck.exists else None
    #         result.append(news_data)
    #     return result

    def get_all_news_with_factchecks(self):
        factcheck_docs = self.factcheck_ref.get()
        result = [doc.to_dict() | {'id': doc.id} for doc in factcheck_docs]
        return result
    def store_user_broadcast(self, user_data: Dict):
        doc_ref = self.db.collection('user_broadcast').document()
        return doc_ref.set(user_data), doc_ref.id

    def get_all_user_broadcasts(self):
        user_docs = self.db.collection('user_broadcast').get()
        return [doc.to_dict() | {'id': doc.id} for doc in user_docs]
