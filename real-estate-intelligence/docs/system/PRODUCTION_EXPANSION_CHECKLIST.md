# INFINITY PRIME — PRODUCTION EXPANSION CHECKLIST (MAX SCOPE)

## DATA SOURCES (CRAWL / INGEST)

### Real Estate
- County tax rolls (delinquency, liens)
- Clerk of court (foreclosures, lis pendens)
- Code enforcement violations
- Permit & zoning records
- Recorder / deed transfers
- Evictions & judgments
- HOA filings (where public)
- Utility shutoff notices (where legal)

### Economic & Macro
- BLS (employment, wages)
- Census ACS (demographics)
- BEA (GDP, income)
- Treasury rates & yield curves
- Fed FRED datasets
- Inflation CPI/PPI
- Consumer credit aggregates

### Social / Behavioral (Public Only)
- X / Reddit / public forums (trend signals)
- Google Trends
- News & press releases
- Company blogs / disclosures
- Public social engagement metrics (no PII)

### Market Intelligence
- M&A announcements
- Bankruptcy filings
- SEC filings (10-K, 10-Q)
- Earnings transcripts
- Supply chain disruptions
- Shipping / port congestion (public feeds)

---

## CRAWLING SYSTEMS

- Distributed crawler pool (Cloud Run Jobs)
- Rate-limited fetchers
- Robots.txt compliance
- Adaptive backoff
- Source health scoring
- Change-detection crawlers (diff-based)
- Snapshot archiving
- Crawl provenance ledger

---

## INGESTION & NORMALIZATION

- Schema-first ingestion (JSON Schema)
- Source adapters (one per source)
- Confidence scoring at ingest
- Deduplication engine
- Temporal alignment
- Geo-normalization
- Entity resolution (addresses, orgs)
- Provenance metadata (source, time, method)

---

## AI / INTELLIGENCE LAYER

- Signal extraction models
- Cross-source correlation
- Anomaly detection
- Trend acceleration detection
- Lead scoring models
- Confidence calibration
- Model explainability artifacts
- Drift detection

---

## MEMORY & KNOWLEDGE

- Time-series memory
- Entity-centric memory
- Event graph
- Versioned facts
- Retention policies
- Cold storage (GCS)
- Audit replay

---

## AUTOMATION & ORCHESTRATION

- Cloud Scheduler triggers
- Event-driven ingestion
- Backpressure controls
- Budget enforcement
- Kill switches
- Canary crawlers
- Rollback logic
- Autonomy caps

---

## GOOGLE CLOUD RUN (PRODUCTION HARDENING)

- Separate services per concern
- Min/max instance tuning
- CPU/memory right-sizing
- Request timeouts
- Concurrency limits
- Regional redundancy
- Private services (VPC)
- Service-to-service auth (IAM)
- Secret Manager integration

---

## OBSERVABILITY

- Structured logs (JSON)
- Metrics (latency, volume, errors)
- Source-level dashboards
- Crawl success rates
- Data freshness SLAs
- Alerting thresholds
- Incident runbooks

---

## SECURITY / COMPLIANCE

- Least-privilege IAM
- No secrets in code
- Audit logs
- Data classification
- Legal source allowlist
- Opt-out enforcement
- Jurisdiction flags

---

## CLIENT VALUE DELIVERY

- Proprietary signal indices
- Early-warning dashboards
- Predictive heatmaps
- Opportunity alerts
- Scenario simulations
- Confidence-ranked insights
- Explainable outputs
- Exportable reports

---

## GOVERNANCE (ANTI-RUNAWAY)

- TIME_BUDGET enforcement
- MAX_FIX_CYCLES enforcement
- Risk gates (SAFE / CAUTION / BLOCKED)
- No auto-merge on BLOCKED
- Human-visible artifacts always
- Deterministic runs only

---

## NON-GOALS (EXPLICIT)

- No scraping behind logins
- No PII enrichment
- No illegal data access
- No black-box recommendations

---

## STATUS
This checklist defines the MAXIMUM EXTENSION SURFACE
for a production-grade, defensible, high-value intelligence platform
built on Google Cloud Run.

