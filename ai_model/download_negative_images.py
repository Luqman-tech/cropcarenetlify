import os
import requests
from pathlib import Path
from tqdm import tqdm

# Directory to save negative images
NEGATIVE_DIR = Path(__file__).parent.parent / "data" / "plantvillage" / "Not_a_Plant"
NEGATIVE_DIR.mkdir(parents=True, exist_ok=True)

# Unsplash API (no key needed for demo, but limited)
UNSPLASH_URL = "https://source.unsplash.com/random/400x400?sig={sig}&{query}"
QUERIES = [
    "person", "people", "animal", "car", "building", "city", "indoor", "outdoor", "object", "food", "furniture", "technology", "street", "portrait", "dog", "cat", "tree", "sky", "mountain", "ocean", "house"
]

NUM_IMAGES = 1000  # Increased for more data

print(f"Downloading {NUM_IMAGES} negative images to {NEGATIVE_DIR}...")

for i in tqdm(range(NUM_IMAGES)):
    query = QUERIES[i % len(QUERIES)]
    url = UNSPLASH_URL.format(sig=i, query=query)
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            with open(NEGATIVE_DIR / f"not_a_plant_{i+1}.jpg", "wb") as f:
                f.write(resp.content)
        else:
            print(f"Failed to download image {i+1}: HTTP {resp.status_code}")
    except Exception as e:
        print(f"Error downloading image {i+1}: {e}")

print("Download complete!") 