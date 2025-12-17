from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import json
from google.oauth2 import service_account
from google.cloud import vision
import PIL.Image
import io
import os
from typing import List, Optional
from datetime import datetime

image_router = APIRouter()

@image_router.post("/analyze-image")
async def analyze_image_endpoint(file: UploadFile = File(...)):
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")
            
        # Check if GEMINI_API_KEY is set
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
            
        # Read image content
        content = await file.read()
        image = PIL.Image.open(io.BytesIO(content))
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Prepare prompt
        prompt = "Analyze the content in this image and detect if it contains misinformation or bias. First state if the content is real or fake. Then give a short summary regarding the content. Then Summarize key points."

        response = model.generate_content([prompt, image])
        
        return {"analysis": response.text}
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Error analyzing image: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=str(e))


# Response models for reverse image search
class WebEntity(BaseModel):
    description: Optional[str] = None
    score: Optional[float] = None


class ImageMatch(BaseModel):
    url: str


class PageWithMatchingImage(BaseModel):
    url: str
    page_title: Optional[str] = None


class ReverseImageSearchResponse(BaseModel):
    pages_with_matching_images: List[PageWithMatchingImage] = []
    full_matching_images: List[ImageMatch] = []
    partial_matching_images: List[ImageMatch] = []
    visually_similar_images: List[ImageMatch] = []
    web_entities: List[WebEntity] = []
    best_guess_labels: List[str] = []
    analysis: str


@image_router.post("/reverse-image-search", response_model=ReverseImageSearchResponse)
async def reverse_image_search_endpoint(file: UploadFile = File(...)):
    """
    Perform reverse image search to find similar images and detect if image is original or edited.
    
    This endpoint uses Google Cloud Vision API's Web Detection to:
    - Find pages with matching images
    - Identify full and partial matches
    - Show visually similar images
    - Provide web entities and labels
    - Help determine if the image is original (oldest match) or edited
    """
    try:
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")
        
        # Check if GOOGLE_APPLICATION_CREDENTIALS is set
        credentials_env = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if not credentials_env:
            raise HTTPException(
                status_code=500, 
                detail="GOOGLE_APPLICATION_CREDENTIALS not configured. Please set up Google Cloud Vision API credentials."
            )
        
        # Read image content
        content = await file.read()
        
        # Create Vision API client
        client = None
        if credentials_env.strip().startswith('{'):
            try:
                service_account_info = json.loads(credentials_env)
                credentials = service_account.Credentials.from_service_account_info(service_account_info)
                client = vision.ImageAnnotatorClient(credentials=credentials)
            except json.JSONDecodeError as e:
                print(f"Error parsing GOOGLE_APPLICATION_CREDENTIALS as JSON: {e}")
                raise HTTPException(status_code=500, detail="Invalid JSON in GOOGLE_APPLICATION_CREDENTIALS")
        else:
            client = vision.ImageAnnotatorClient()
        
        # Construct the image
        image = vision.Image(content=content)
        
        # Perform web detection
        web_detection = client.web_detection(image=image).web_detection
        
        # Parse the response
        pages_with_matching_images = []
        if web_detection.pages_with_matching_images:
            for page in web_detection.pages_with_matching_images[:10]:  # Limit to top 10
                pages_with_matching_images.append(
                    PageWithMatchingImage(
                        url=page.url,
                        page_title=page.page_title if hasattr(page, 'page_title') else None
                    )
                )
        
        full_matching_images = []
        if web_detection.full_matching_images:
            for image_match in web_detection.full_matching_images[:10]:  # Limit to top 10
                full_matching_images.append(ImageMatch(url=image_match.url))
        
        partial_matching_images = []
        if web_detection.partial_matching_images:
            for image_match in web_detection.partial_matching_images[:10]:  # Limit to top 10
                partial_matching_images.append(ImageMatch(url=image_match.url))
        
        visually_similar_images = []
        if web_detection.visually_similar_images:
            for image_match in web_detection.visually_similar_images[:10]:  # Limit to top 10
                visually_similar_images.append(ImageMatch(url=image_match.url))
        
        web_entities = []
        if web_detection.web_entities:
            for entity in web_detection.web_entities[:10]:  # Limit to top 10
                web_entities.append(
                    WebEntity(
                        description=entity.description if entity.description else None,
                        score=entity.score if entity.score else None
                    )
                )
        
        best_guess_labels = []
        if web_detection.best_guess_labels:
            best_guess_labels = [label.label for label in web_detection.best_guess_labels]
        
        # Generate analysis summary
        analysis = generate_image_authenticity_analysis(
            pages_count=len(web_detection.pages_with_matching_images) if web_detection.pages_with_matching_images else 0,
            full_matches_count=len(web_detection.full_matching_images) if web_detection.full_matching_images else 0,
            partial_matches_count=len(web_detection.partial_matching_images) if web_detection.partial_matching_images else 0,
            visually_similar_count=len(web_detection.visually_similar_images) if web_detection.visually_similar_images else 0,
            has_entities=len(web_entities) > 0
        )
        
        return ReverseImageSearchResponse(
            pages_with_matching_images=pages_with_matching_images,
            full_matching_images=full_matching_images,
            partial_matching_images=partial_matching_images,
            visually_similar_images=visually_similar_images,
            web_entities=web_entities,
            best_guess_labels=best_guess_labels,
            analysis=analysis
        )
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Error performing reverse image search: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=str(e))


def generate_image_authenticity_analysis(
    pages_count: int,
    full_matches_count: int,
    partial_matches_count: int,
    visually_similar_count: int,
    has_entities: bool
) -> str:
    """Generate a human-readable analysis of image authenticity based on search results."""
    
    analysis_parts = []
    
    if full_matches_count == 0 and partial_matches_count == 0 and pages_count == 0:
        analysis_parts.append(
            "🔍 **No Matches Found**: This image does not appear anywhere on the indexed web. "
            "This could mean it's a newly created/original image, or it's not publicly available online."
        )
    else:
        if full_matches_count > 0:
            analysis_parts.append(
                f"✅ **{full_matches_count} Full Matches Found**: This exact image appears on {full_matches_count} "
                f"web page(s). Check the URLs to see the oldest publication date - the earliest appearance "
                f"is likely the original source."
            )
        
        if partial_matches_count > 0:
            analysis_parts.append(
                f"⚠️ **{partial_matches_count} Partial Matches Found**: Similar but slightly different versions "
                f"of this image exist online. This could indicate the image has been cropped, edited, or modified."
            )
        
        if pages_count > 0:
            analysis_parts.append(
                f"📄 **{pages_count} Pages with Matching Images**: This image appears on {pages_count} different "
                f"web pages. Check the pages to verify context and find the original source."
            )
        
        if visually_similar_count > 0:
            analysis_parts.append(
                f"🔎 **{visually_similar_count} Visually Similar Images**: Found related images that share "
                f"visual characteristics. These might be from the same event, location, or subject matter."
            )
    
    if has_entities:
        analysis_parts.append(
            "🏷️ **Web Entities Detected**: The image has been identified with specific labels and entities "
            "based on its web presence, helping to understand its content and context."
        )
    
    # Add recommendation
    analysis_parts.append(
        "\n**Recommendation**: To verify if your image is original or edited:\n"
        "1. Check the URLs of full matches for publication dates (oldest is likely original)\n"
        "2. Compare partial matches to see what changes were made\n"
        "3. Visit the pages to understand the context and source\n"
        "4. If no matches found, your image might be unique or unpublished"
    )
    
    return "\n\n".join(analysis_parts)
