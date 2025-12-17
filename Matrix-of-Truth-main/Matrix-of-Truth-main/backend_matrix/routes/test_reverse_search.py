"""
Test script for reverse image search functionality.
Make sure to set GOOGLE_APPLICATION_CREDENTIALS before running this test.
"""

import requests
import sys
import os

def test_reverse_image_search(image_path: str, api_url: str = "http://localhost:8000/reverse-image-search"):
    """
    Test the reverse image search endpoint.
    
    Args:
        image_path: Path to the image file to test
        api_url: URL of the API endpoint (default: localhost:8000)
    """
    if not os.path.exists(image_path):
        print(f"❌ Error: Image file not found: {image_path}")
        return
    
    print(f"🔍 Testing reverse image search for: {image_path}")
    print(f"📡 API URL: {api_url}")
    print("-" * 60)
    
    try:
        # Open and send the image file
        with open(image_path, 'rb') as image_file:
            files = {'file': image_file}
            response = requests.post(api_url, files=files)
        
        # Check response status
        if response.status_code == 200:
            print("✅ Request successful!\n")
            data = response.json()
            
            # Print results
            print("📊 RESULTS:")
            print("=" * 60)
            
            print(f"\n📄 Pages with matching images: {len(data['pages_with_matching_images'])}")
            if data['pages_with_matching_images']:
                for i, page in enumerate(data['pages_with_matching_images'][:3], 1):
                    print(f"  {i}. {page['url']}")
                    if page.get('page_title'):
                        print(f"     Title: {page['page_title']}")
            
            print(f"\n✅ Full matches: {len(data['full_matching_images'])}")
            if data['full_matching_images']:
                for i, img in enumerate(data['full_matching_images'][:3], 1):
                    print(f"  {i}. {img['url']}")
            
            print(f"\n⚠️  Partial matches: {len(data['partial_matching_images'])}")
            if data['partial_matching_images']:
                for i, img in enumerate(data['partial_matching_images'][:3], 1):
                    print(f"  {i}. {img['url']}")
            
            print(f"\n🔎 Visually similar: {len(data['visually_similar_images'])}")
            if data['visually_similar_images']:
                for i, img in enumerate(data['visually_similar_images'][:3], 1):
                    print(f"  {i}. {img['url']}")
            
            print(f"\n🏷️  Web entities: {len(data['web_entities'])}")
            if data['web_entities']:
                for i, entity in enumerate(data['web_entities'][:5], 1):
                    score = f"{entity['score']:.2f}" if entity.get('score') else "N/A"
                    desc = entity.get('description', 'Unknown')
                    print(f"  {i}. {desc} (Score: {score})")
            
            print(f"\n🔖 Best guess labels: {', '.join(data['best_guess_labels']) if data['best_guess_labels'] else 'None'}")
            
            print("\n" + "=" * 60)
            print("📝 ANALYSIS:")
            print("=" * 60)
            print(data['analysis'])
            
        else:
            print(f"❌ Request failed with status code: {response.status_code}")
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the API server is running!")
        print("   Start the server with: python main.py")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    # Check if GOOGLE_APPLICATION_CREDENTIALS is set
    if not os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
        print("⚠️  WARNING: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set!")
        print("   Please set it before running the test:")
        print("   Windows PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS='path/to/key.json'")
        print("   Linux/Mac: export GOOGLE_APPLICATION_CREDENTIALS='path/to/key.json'")
        print()
    
    # Get image path from command line arguments
    if len(sys.argv) < 2:
        print("Usage: python test_reverse_search.py <image_path> [api_url]")
        print("Example: python test_reverse_search.py test_image.jpg")
        print("Example: python test_reverse_search.py test_image.jpg http://localhost:8000/reverse-image-search")
        sys.exit(1)
    
    image_path = sys.argv[1]
    api_url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8000/reverse-image-search"
    
    test_reverse_image_search(image_path, api_url)
