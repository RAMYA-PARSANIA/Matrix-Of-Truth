import os
import json
from google.cloud import storage
from google.oauth2 import service_account
from pathlib import Path

def get_credentials():
    """Get Google Cloud credentials from JSON in environment variable"""
    creds_json = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    if creds_json:
        try:
            creds_dict = json.loads(creds_json)
            return service_account.Credentials.from_service_account_info(creds_dict)
        except json.JSONDecodeError:
            # If it's a file path, return None to use default
            return None
    return None

def download_from_gcs(bucket_name, source_blob_name, destination_file_name):
    """Download a file from Google Cloud Storage"""
    try:
        credentials = get_credentials()
        storage_client = storage.Client(credentials=credentials) if credentials else storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(source_blob_name)
        
        # Create directory if doesn't exist
        Path(destination_file_name).parent.mkdir(parents=True, exist_ok=True)
        
        blob.download_to_filename(destination_file_name)
        print(f"✓ Downloaded {source_blob_name} to {destination_file_name}")
        return True
    except Exception as e:
        print(f"✗ Error downloading {source_blob_name}: {e}")
        return False

def download_folder_from_gcs(bucket_name, prefix, local_dir):
    """Download all files from a GCS folder"""
    try:
        credentials = get_credentials()
        storage_client = storage.Client(credentials=credentials) if credentials else storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blobs = bucket.list_blobs(prefix=prefix)
        
        downloaded = 0
        for blob in blobs:
            if blob.name.endswith('/'):
                continue  # Skip directory markers
            
            # Calculate local path
            relative_path = blob.name[len(prefix):].lstrip('/')
            local_path = os.path.join(local_dir, relative_path)
            
            # Create directory if doesn't exist
            Path(local_path).parent.mkdir(parents=True, exist_ok=True)
            
            # Download file
            blob.download_to_filename(local_path)
            print(f"✓ Downloaded {blob.name} to {local_path}")
            downloaded += 1
        
        print(f"✓ Downloaded {downloaded} files from {prefix}")
        return True
    except Exception as e:
        print(f"✗ Error downloading folder {prefix}: {e}")
        return False

def ensure_models_available():
    """Download models from GCS if not present locally"""
    models_to_download = [
        {
            'bucket': 'matrix-of-truth-models',
            'blob': 'deepfake_detector.h5',
            'local': 'deepfake_detection/deepfake_detector.h5'
        },
        {
            'bucket': 'matrix-of-truth-models',
            'blob': 'knowledge_graph_final.pkl',
            'local': 'nlp_model/knowledge_graph_final.pkl'
        },
    ]
    
    # Download individual files
    for model in models_to_download:
        local_path = os.path.join(os.path.dirname(__file__), '..', model['local'])
        if not os.path.exists(local_path):
            print(f"Downloading {model['blob']}...")
            download_from_gcs(model['bucket'], model['blob'], local_path)
        else:
            print(f"✓ Model already exists: {model['local']}")
    
    # Download NLP checkpoint folder
    checkpoint_dir = os.path.join(os.path.dirname(__file__), '..', 'checkpoint-753')
    if not os.path.exists(checkpoint_dir):
        print(f"Downloading checkpoint-753 folder...")
        download_folder_from_gcs('matrix-of-truth-models', 'checkpoint-753/', checkpoint_dir)
    else:
        print(f"✓ Checkpoint already exists: checkpoint-753")

if __name__ == "__main__":
    ensure_models_available()
