import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

# Set your GEMINI_API_KEY environment variable before running
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

grounding_tool = types.Tool(google_search=types.GoogleSearch())
config = types.GenerateContentConfig(tools=[grounding_tool], temperature=0.3)

scam_queries = [
    "latest phone scam news articles 2024 2025",
    "recent delivery parcel scam news 2024 2025",
    "cryptocurrency investment fraud news 2024 2025",
    "email phishing banking scam news 2024 2025",
    "social media scam news articles 2024 2025"
]

all_scams = []

for query in scam_queries:
    print(f"\nSearching: {query}")
    print("="*80)
    
    prompt = f"""Find 2 recent news articles about: {query}

For each article provide:
TITLE: [exact article headline]
URL: [full article URL]
SOURCE: [website name like BBC, CNN, FTC.gov, etc]
DESCRIPTION: [2-3 sentence summary of the scam]
CATEGORY: [one of: Impersonation, Delivery Scam, Cryptocurrency Scam, Email Phishing, Social Media Scam, Romance Scam, Tech Support Scam]
SEVERITY: [High or Medium]
WARNING: [one sentence safety tip]
---"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=config,
    )
    
    print(response.text)
    print("\n")

print("\n" + "="*80)
print("COPY THE OUTPUT ABOVE AND PASTE INTO THE COMPONENT")
print("="*80)
