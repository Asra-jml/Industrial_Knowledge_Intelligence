import requests
import json

BASE = "http://127.0.0.1:8000/api/compliance"

# 1. Dashboard
print("=== COMPLIANCE DASHBOARD ===")
r = requests.get(f"{BASE}/dashboard", timeout=30)
r.raise_for_status()
d = r.json()
print(f"Total requirements: {d['total_requirements']}")
print(f"Gaps: {d['gaps']}")
print(f"Compliant: {d['compliant']}")
print(f"Open: {d['open']}")
print(f"NCRs: {d['ncr_total']} ({d['ncr_open']} open)")
print(f"CAPAs: {d['capa_total']} ({d['capa_open']} open)")
print(f"Assets tracked: {len(d['asset_status'])}")
print(f"Regulations: {list(d['regulation_breakdown'].keys())}")

# 2. Gaps
print("\n=== COMPLIANCE GAPS ===")
r = requests.get(f"{BASE}/gaps", timeout=30)
r.raise_for_status()
gaps = r.json()
print(f"Total gaps/open: {gaps['count']}")
for g in gaps["gaps"]:
    print(f"  [{g['status']}] {g['req_id']} — {g['regulation']} / {g['clause']}")
    print(f"    Asset: {g['applies_to']} | Note: {g['gap_note']}")

# 3. Evidence pack for P-101
print("\n=== EVIDENCE PACK: P-101 ===")
r = requests.get(f"{BASE}/evidence/P-101", timeout=60)
r.raise_for_status()
ep = r.json()
print(f"Compliance entries: {len(ep['compliance_entries'])}")
print(f"NCRs: {len(ep['ncrs'])}")
print(f"CAPAs: {len(ep['capas'])}")
print(f"Inspections: {len(ep['inspections'])}")
print(f"Linked documents: {len(ep['linked_documents'])}")
print(f"\nNarrative:\n{ep['narrative']}")
