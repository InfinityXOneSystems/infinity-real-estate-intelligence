# Infinity Prime PR Rules

## PR title format
[IP][<Tier>][<Area>] Short action
Examples:
- [IP][T1][CI] Add smoke tests and artifact uploads
- [IP][T2][API] Add seller pause/resume transaction wrapper
- [IP][T3][AUTH] (blocked) RBAC policy change proposal

### Labels (required)
- infinity-prime
- tier-1 / tier-2 / tier-3 / tier-4
- contract-change (if /frontend_contract touched)
- blocked-approval-required (Tier 3/4 only)
- blocked-permissions (if secrets/permissions missing)

### One-task-per-PR rule
If the PR touches more than one distinct task ID, split it.
