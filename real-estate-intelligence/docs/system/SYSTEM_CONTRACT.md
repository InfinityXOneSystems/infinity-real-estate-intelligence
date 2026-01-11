# REAL ESTATE INTELLIGENCE — SYSTEM CONTRACT

Signals:
- distressed_property
- tax_delinquent
- foreclosure
- absentee_owner

Pipeline:
crawler -> gateway -> memory -> agents -> query

Non-goals:
- MLS scraping
- PII enrichment
- Automated purchasing
