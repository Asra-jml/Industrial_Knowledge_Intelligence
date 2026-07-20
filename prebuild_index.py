import sys
from backend.rag.copilot_engine import CopilotEngine

print("Pre-building FAISS index...")
engine = CopilotEngine()
engine.build()
print("Done!")
