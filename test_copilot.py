import requests
import json
import sys
import time

url = "http://127.0.0.1:8000/api/copilot/ask"
payload = {"query": "What is the status of pump P-101?"}
headers = {"Content-Type": "application/json"}

print("Sending request to Copilot API (this may take a few minutes if building the FAISS index)...")
start = time.time()
try:
    response = requests.post(url, json=payload, headers=headers, timeout=600)
    response.raise_for_status()
    data = response.json()
    elapsed = time.time() - start
    
    print(f"\n--- COPILOT RESPONSE (in {elapsed:.1f}s) ---")
    print(f"Answer:\n{data.get('answer')}\n")
    print(f"Confidence: {data.get('confidence')}")
    print(f"Sources Used: {data.get('sources_used')}")
    print("\nCitations:")
    for i, c in enumerate(data.get('citations', [])):
        print(f"[{i+1}] {c.get('doc_id')} (score: {c.get('score'):.2f})")
        
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
    if hasattr(e, 'response') and e.response is not None:
        print(f"Details: {e.response.text}")
