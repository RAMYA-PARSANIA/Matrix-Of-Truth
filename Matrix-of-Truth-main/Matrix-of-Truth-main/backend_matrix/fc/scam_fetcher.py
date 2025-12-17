import os
from datetime import datetime
from typing import List, Dict, Any
import logging
from google import genai
from google.genai import types
from db.database_service import DatabaseService

logger = logging.getLogger(__name__)

class ScamFetcher:
    """Fetches current scams and fraud alerts using Gemini API with Google Search."""
    
    def __init__(self):
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        if self.gemini_api_key:
            self.client = genai.Client(api_key=self.gemini_api_key)
        else:
            self.client = None
            logger.warning("GEMINI_API_KEY not set")
        self.db_service = DatabaseService()
        
    def fetch_latest_scams(self) -> List[Dict[str, Any]]:
        """Fetch latest scam news articles using Gemini with Google Search."""
        if not self.client:
            logger.error("Gemini client not initialized")
            return []
        
        scams = []
        
        # Search for actual news articles about scams
        scam_queries = [
            "latest news articles about phone scams and police impersonation scams 2024 2025",
            "recent news about delivery courier scams fake parcels drug accusations 2024 2025",
            "cryptocurrency investment fraud scam news articles 2024 2025",
            "email phishing online banking scam news 2024 2025",
            "social media scams Facebook Instagram WhatsApp news 2024 2025",
            "romance scams catfishing news articles 2024 2025",
            "tech support scams Microsoft Apple news 2024 2025",
        ]
        
        grounding_tool = types.Tool(google_search=types.GoogleSearch())
        config = types.GenerateContentConfig(tools=[grounding_tool], temperature=0.3)
        
        for query in scam_queries:
            try:
                prompt = f"""Search for recent news articles about: {query}

Find 3-5 actual news articles from credible sources (news websites, cybersecurity blogs, consumer protection agencies) and provide:
1. Article title
2. Source website name
3. Brief summary of the scam being reported (2-3 sentences)
4. How the scam works
5. Warning/advice from the article

Format each article as:
TITLE: [Article headline]
SOURCE: [Website name]
SUMMARY: [Brief description of what the article reports]
HOW IT WORKS: [Explanation of the scam method]
WARNING: [Safety advice from the article]
URL: [Article URL if available, otherwise search query]
---"""

                response = self.client.models.generate_content(
                    model="gemini-flash-latest",
                    contents=prompt,
                    config=config,
                )
                
                if response.text:
                    parsed_scams = self._parse_news_response(response.text, query)
                    scams.extend(parsed_scams)
                    
            except Exception as e:
                logger.error(f"Error fetching scam news for query '{query}': {e}")
        
        # Remove duplicates and categorize
        unique_scams = self._remove_duplicates(scams)
        categorized_scams = self._categorize_scams(unique_scams[:20])
        
        return categorized_scams
    
    def _parse_news_response(self, response_text: str, original_query: str) -> List[Dict[str, Any]]:
        """Parse Gemini's news article response into structured scam data."""
        scams = []
        
        # Split by article separator
        article_blocks = response_text.split('---')
        
        for block in article_blocks:
            if not block.strip():
                continue
                
            scam_data = {
                'title': '',
                'source': '',
                'summary': '',
                'how_it_works': '',
                'warning': '',
                'url': '',
                'fetched_at': datetime.now().isoformat(),
            }
            
            lines = block.strip().split('\n')
            current_field = None
            
            for line in lines:
                line = line.strip()
                if line.startswith('TITLE:'):
                    scam_data['title'] = line.replace('TITLE:', '').strip()
                    current_field = 'title'
                elif line.startswith('SOURCE:'):
                    scam_data['source'] = line.replace('SOURCE:', '').strip()
                    current_field = 'source'
                elif line.startswith('SUMMARY:'):
                    scam_data['summary'] = line.replace('SUMMARY:', '').strip()
                    current_field = 'summary'
                elif line.startswith('HOW IT WORKS:'):
                    scam_data['how_it_works'] = line.replace('HOW IT WORKS:', '').strip()
                    current_field = 'how_it_works'
                elif line.startswith('WARNING:'):
                    scam_data['warning'] = line.replace('WARNING:', '').strip()
                    current_field = 'warning'
                elif line.startswith('URL:'):
                    scam_data['url'] = line.replace('URL:', '').strip()
                    current_field = 'url'
                elif line and current_field and current_field != 'url':
                    # Continue previous field (but not URL)
                    scam_data[current_field] += ' ' + line
            
            # Combine summary and how_it_works for description
            if scam_data['title']:
                full_description = scam_data['summary']
                if scam_data['how_it_works']:
                    full_description += ' ' + scam_data['how_it_works']
                
                # If no URL provided, create a search URL
                if not scam_data['url'] or scam_data['url'].startswith('search'):
                    scam_data['url'] = f"https://www.google.com/search?q={scam_data['title'].replace(' ', '+')}"
                
                scams.append({
                    'title': scam_data['title'],
                    'description': full_description.strip(),
                    'url': scam_data['url'],
                    'source': scam_data['source'] if scam_data['source'] else 'News Article via Gemini Search',
                    'warning': scam_data['warning'] if scam_data['warning'] else 'Stay vigilant and verify before taking action.',
                    'timestamp': scam_data['fetched_at']
                })
        
        return scams
    
    def _remove_duplicates(self, scams: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate scams based on title similarity."""
        unique = []
        seen_titles = set()
        
        for scam in scams:
            title_lower = scam['title'].lower()
            # Simple duplicate check
            if title_lower not in seen_titles and len(title_lower) > 10:
                seen_titles.add(title_lower)
                unique.append(scam)
                
        return unique
    
    def _categorize_scams(self, scams: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Categorize scams by type using keyword matching."""
        categories_keywords = {
            'Phone Scam': ['phone', 'call', 'caller', 'robocall', 'voicemail', 'telephone'],
            'Email Phishing': ['email', 'phishing', 'spam', 'link', 'attachment', 'inbox'],
            'Social Media Scam': ['facebook', 'instagram', 'twitter', 'social media', 'dm', 'whatsapp', 'telegram'],
            'Investment Fraud': ['investment', 'trading', 'stocks', 'profit', 'return', 'forex'],
            'Delivery Scam': ['delivery', 'package', 'parcel', 'courier', 'shipping', 'fedex', 'ups', 'dhl'],
            'Impersonation': ['police', 'irs', 'government', 'officer', 'official', 'tax', 'fbi', 'customs'],
            'Cryptocurrency Scam': ['crypto', 'bitcoin', 'ethereum', 'wallet', 'blockchain', 'nft'],
            'Romance Scam': ['dating', 'romance', 'relationship', 'love', 'match', 'tinder'],
            'Tech Support Scam': ['tech support', 'microsoft', 'apple', 'computer', 'virus', 'antivirus'],
        }
        
        categorized = []
        for scam in scams:
            text = (scam['title'] + ' ' + scam['description']).lower()
            
            category = 'Other'
            for cat, keywords in categories_keywords.items():
                if any(keyword in text for keyword in keywords):
                    category = cat
                    break
            
            # Determine severity based on keywords
            severity = 'Medium'
            high_severity_keywords = ['urgent', 'immediate', 'arrest', 'legal action', 'suspended', 'frozen', 'drugs', 'criminal']
            medium_severity_keywords = ['alert', 'beware', 'caution', 'warning', 'fraud']
            
            if any(word in text for word in high_severity_keywords):
                severity = 'High'
            elif any(word in text for word in medium_severity_keywords):
                severity = 'Medium'
            else:
                severity = 'Low'
            
            categorized.append({
                **scam,
                'category': category,
                'severity': severity
            })
        
        return categorized

    def process_single_scam(self):
        scam = self.db_service.get_unprocessed_scam()

        if not scam:
            # Fetch new scams
            new_scams = self.fetch_latest_scams()
            if new_scams:
                self.db_service.store_scams_queue(new_scams)
                return self.process_single_scam()
            
            return {'status': 'refresh', 'content': 'Refreshing scam database'}

        # Check if already in 'newest' to avoid re-broadcasting
        result = self.db_service.mark_scam_processed(scam['id'], scam)
        
        if result:
            # It was added (not duplicate)
            return {
                "status": "success",
                "content": scam
            }
        else:
            # Duplicate, skip and try next
            return self.process_single_scam()
