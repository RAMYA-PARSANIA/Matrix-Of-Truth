# Environment Setup Helper for Reverse Image Search
# This script helps verify your Google Cloud Vision API setup

import os
import sys

def check_credentials():
    """Check if Google Cloud credentials are properly configured."""
    
    print("=" * 70)
    print("🔍 REVERSE IMAGE SEARCH - ENVIRONMENT CHECK")
    print("=" * 70)
    print()
    
    # Check for GOOGLE_APPLICATION_CREDENTIALS
    creds_env = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    
    if not creds_env:
        print("❌ GOOGLE_APPLICATION_CREDENTIALS is NOT set")
        print()
        print("To fix this, run one of these commands:")
        print()
        print("Windows PowerShell:")
        print('  $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\your-key.json"')
        print()
        print("Windows Command Prompt:")
        print('  set GOOGLE_APPLICATION_CREDENTIALS=C:\\path\\to\\your-key.json')
        print()
        print("Linux/Mac:")
        print('  export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-key.json"')
        print()
        return False
    
    # Check if it's JSON content
    if creds_env.strip().startswith('{'):
        print("✅ GOOGLE_APPLICATION_CREDENTIALS is set (JSON content detected)")
        print()
        
        try:
            import json
            content = json.loads(creds_env)
            if "type" in content and content["type"] == "service_account":
                print("✅ Credentials JSON appears to be valid service account key")
                print()
            else:
                print("⚠️  Credentials JSON might not be a valid service account key")
                print()
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in GOOGLE_APPLICATION_CREDENTIALS: {e}")
            print()
            return False
            
    else:
        # It's a file path
        print("✅ GOOGLE_APPLICATION_CREDENTIALS is set")
        print(f"   Path: {creds_env}")
        print()
        
        # Check if file exists
        if not os.path.exists(creds_env):
            print(f"❌ Credentials file NOT FOUND at: {creds_env}")
            print()
            print("Please verify:")
            print("  1. The file path is correct")
            print("  2. The file exists at that location")
            print("  3. You have permission to read the file")
            print()
            return False
        
        print("✅ Credentials file exists")
        print()
        
        # Check if file is readable
        try:
            with open(creds_env, 'r') as f:
                content = f.read()
                if '"type": "service_account"' in content or '"private_key"' in content:
                    print("✅ Credentials file appears to be valid JSON")
                    print()
                else:
                    print("⚠️  Credentials file might not be a valid service account key")
                    print("   Make sure you downloaded the JSON key file from Google Cloud")
                    print()
        except Exception as e:
            print(f"❌ Cannot read credentials file: {e}")
            print()
            return False
    
    # Try to import google-cloud-vision
    print("Checking Python packages...")
    try:
        from google.cloud import vision
        print("✅ google-cloud-vision package is installed")
        print()
    except ImportError:
        print("❌ google-cloud-vision package is NOT installed")
        print()
        print("To install it, run:")
        print("  pip install google-cloud-vision")
        print()
        return False
    
    # Try to create a client
    print("Testing Vision API client creation...")
    try:
        client = vision.ImageAnnotatorClient()
        print("✅ Vision API client created successfully")
        print()
        print("=" * 70)
        print("🎉 SETUP COMPLETE! You're ready to use reverse image search!")
        print("=" * 70)
        print()
        print("Next steps:")
        print("  1. Start the server: python backend_matrix/main.py")
        print("  2. Test with an image: python backend_matrix/routes/test_reverse_search.py image.jpg")
        print("  3. Or use the API endpoint: POST /reverse-image-search")
        print()
        return True
        
    except Exception as e:
        print(f"❌ Error creating Vision API client: {e}")
        print()
        print("This might mean:")
        print("  1. Your credentials are invalid")
        print("  2. The Vision API is not enabled in your Google Cloud project")
        print("  3. The service account doesn't have the right permissions")
        print()
        print("To fix:")
        print("  1. Go to https://console.cloud.google.com/")
        print("  2. Select your project")
        print("  3. Go to 'APIs & Services' > 'Library'")
        print("  4. Search for 'Cloud Vision API' and enable it")
        print("  5. Go to 'IAM & Admin' > 'Service Accounts'")
        print("  6. Make sure your service account has 'Cloud Vision AI Service Agent' role")
        print()
        return False


def show_test_command():
    """Show how to test the feature."""
    print()
    print("=" * 70)
    print("📝 TESTING INSTRUCTIONS")
    print("=" * 70)
    print()
    print("To test reverse image search:")
    print()
    print("1. Make sure the backend server is running:")
    print("   cd backend_matrix")
    print("   python main.py")
    print()
    print("2. In another terminal, run the test script:")
    print("   python backend_matrix/routes/test_reverse_search.py <image_path>")
    print()
    print("   Example:")
    print("   python backend_matrix/routes/test_reverse_search.py test.jpg")
    print()
    print("3. Or test with cURL:")
    print('   curl -X POST "http://localhost:8000/reverse-image-search" -F "file=@test.jpg"')
    print()


if __name__ == "__main__":
    print()
    success = check_credentials()
    
    if success:
        if len(sys.argv) > 1 and sys.argv[1] == "--test":
            show_test_command()
    else:
        print("Please fix the issues above and run this script again to verify your setup.")
        print()
        sys.exit(1)
