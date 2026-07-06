# F4 — Quality & Regulatory Compliance Intelligence · Owner: shared

**Status:** stub — F1 outputs are ready for you.

## Contract
- **Reads:** `SharedCorpus/11_quality_compliance/compliance_register.csv`
  (`req_id, regulation, clause, requirement, applies_to, linked_procedure, evidence, status, gap_note`;
  status ∈ GAP/COMPLIANT/OPEN), the knowledge graph (GOVERNED_BY / RAISED_AS / ADDRESSED_BY edges),
  and `SharedCorpus/shared/documents.jsonl` for evidence documents.
- **Produces:** router at `backend/api/routers/compliance.py` — GAP detection + per-asset
  evidence pack (linked docs; WeasyPrint/reportlab PDF export is stretch).

## Acceptance (PRD)
Flags the P-101 inspection gap against Factories Act / OISD-STD-128 and generates its evidence pack.
