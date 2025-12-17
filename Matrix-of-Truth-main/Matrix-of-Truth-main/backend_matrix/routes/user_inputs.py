from .news_summ import get_news
from newsapi.newsapi_client import NewsApiClient
from fastapi import APIRouter, HTTPException
import os
from dotenv import load_dotenv
from factcheck_instance import fact_checker_instance

from pydantic import BaseModel

class UrlInput(BaseModel):
    url: str

class TextInput(BaseModel):
    text: str

class SearchQuery(BaseModel):
    query: str

class NewsSelectionInput(BaseModel):
    news_url: str

load_dotenv()

input_router = APIRouter()

@input_router.post("/search-news")
async def search_news(search_data: SearchQuery):
    try:
        newsapi = NewsApiClient(api_key=os.environ.get('NEWS_API_KEY'))

        news = newsapi.get_top_headlines(q=search_data.query, country="IN", language='en', page=1, page_size=10)
        
        if not news['articles']:
            return {
                "status": "error",
                "content": "No news found for the given query"
            }

        return {
            "status": "success",
            "content": {
                "news_items": [article for article in news['articles']]
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@input_router.post("/fact-check-selected-news")
async def fact_check_selected_news(selection: NewsSelectionInput):
    try:
        if not selection.news_url or not selection.news_url.strip():
            raise HTTPException(status_code=400, detail="News URL cannot be empty")
            
        # Get the news content using the existing get_news function
        news_result = get_news(selection.news_url)
        
        if news_result.get('status') == 'error' or len(news_result.get("summary", "")) == 0:
            return {
                "status": "error",
                "content": "Unable to fetch the news from the url. Please try a different link"
            }
        
        # Initialize the fact checker
        fact_checker = fact_checker_instance
        if fact_checker is None:
            raise HTTPException(status_code=500, detail="Fact checker not initialized")
        
        # Generate the fact check report
        fact_check_result = fact_checker.generate_report(news_result.get('summary', ''))
        
        if not fact_check_result:
            raise HTTPException(status_code=500, detail="Fact check failed to generate results")
        
        return {
            "status": "success",
            "content": {
                "fact_check_result": {
                    "detailed_analysis": {
                        "overall_analysis": fact_check_result.get("detailed_analysis", {}).get("overall_analysis", {}),
                        "claim_analysis": fact_check_result.get("detailed_analysis", {}).get("claim_analysis", []),
                        "source_analysis": fact_check_result.get("source_credibility", [])
                    }
                },
                "sources": fact_check_result.get("sources", [])
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Error in fact checking selected news: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=str(e))

@input_router.post("/get-fc-url")
async def get_fc_url(input_data: UrlInput):
    try:
        if not input_data.url or not input_data.url.strip():
            raise HTTPException(status_code=400, detail="URL cannot be empty")
            
        news_text = get_news(input_data.url)
      
        if news_text.get('status') == 'error':
            return {
                "status": "error",
                "content": "Unable to fetch the news from the url. Please try a different link"
            }
        
        fact_checker = fact_checker_instance
        if fact_checker is None:
            raise HTTPException(status_code=500, detail="Fact checker not initialized")
            
        # Run fact check - it will be run through transformation pipeline
        fact_check_result1 = fact_checker.generate_report(news_text.get('text', ''))
        
        if not fact_check_result1:
            raise HTTPException(status_code=500, detail="Fact check failed to generate results")
        
        #return an object with fact check result and visualization data, and explanation
        return {
            "status": "success",
            "content": {
                "fact_check_result": {
                    "detailed_analysis" : {
                        "overall_analysis" : fact_check_result1.get("detailed_analysis", {}).get("overall_analysis", {}),
                        "claim_analysis" : fact_check_result1.get("detailed_analysis", {}).get("claim_analysis", []),
                        "source_analysis" : fact_check_result1.get("source_credibility", [])
                    }
                },
                "sources": fact_check_result1.get("sources", [])
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Error in fact checking URL: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=str(e))
    
@input_router.post("/get-fc-text")
async def get_fc_text(input_data: TextInput):
    try:
        if not input_data.text or not input_data.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
            
        fact_checker = fact_checker_instance
        if fact_checker is None:
            raise HTTPException(status_code=500, detail="Fact checker not initialized")
            
        # Run fact check - it will be run through transformation pipeline
        fact_check_result1 = fact_checker.generate_report(input_data.text)
        
        if not fact_check_result1:
            raise HTTPException(status_code=500, detail="Fact check failed to generate results")
   
        #return an object with fact check result and visualization data, and explanation
        return {
            "status": "success",
            "content": {
                "fact_check_result": {
                    "detailed_analysis" : {
                        "overall_analysis" : fact_check_result1.get("detailed_analysis", {}).get("overall_analysis", {}),
                        "claim_analysis" : fact_check_result1.get("detailed_analysis", {}).get("claim_analysis", []),
                        "source_analysis" : fact_check_result1.get("source_credibility", [])
                    }
                },
                "sources": fact_check_result1.get("sources", [])
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Error in fact checking: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=str(e))