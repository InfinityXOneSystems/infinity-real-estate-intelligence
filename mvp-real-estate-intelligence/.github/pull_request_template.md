# Infinity Prime PR — Self-Validating Change

## Summary (1–3 sentences)
<!-- What changed and why, in plain English. -->

## Scope
- Task ID(s): <!-- e.g., P1.2, MVP-03 -->
- Change type: [ ] Additive only  [ ] Feature-flagged  [ ] Backward compatible
- Risk tier: [ ] Tier 1  [ ] Tier 2  [ ] Tier 3 (approval required)  [ ] Tier 4 (approval required)

## Protected Paths Check (mandatory)
- [ ] I did NOT delete/move/rename existing production structure
- [ ] If Tier 3/4 files were touched, this PR is labeled `blocked-approval-required` and contains a full plan + rollback

## What’s Included
- [ ] Code changes
- [ ] Tests added/updated
- [ ] Contract updates (`/frontend_contract`) if needed
- [ ] Docs updated (system + decisions)
- [ ] CI / workflows updated (if applicable)

## Infinity Prime Gates (must be green)
Attach links to the GitHub Actions run(s):
- CI Run URL: <!-- paste -->
- Integration Run URL (Firestore emulator): <!-- paste -->
- Smoke Test Output Artifact: <!-- paste -->
- Contract Check Artifact: <!-- paste -->

Checklist:
- [ ] ESLint passes
- [ ] Typecheck passes
- [ ] Unit tests pass
- [ ] Contract check passes (`contract:check`)
- [ ] Build passes
- [ ] Integration tests pass (Firestore emulator job)
- [ ] Smoke tests pass (local server in CI)

## Determinism Compliance
- [ ] `docs/system/*` updated only with deterministic outputs (stable ordering, no timestamps)
- [ ] Nondeterministic logs are stored as CI artifacts only

## Golden Eval / Truth Harness
- [ ] Golden fixtures unchanged OR improved with justification
- [ ] Golden eval tests pass (no truth regression)

## Feature Flags / Rollout
Flags added/used (if any):
- Flag name(s): <!-- e.g., INFINITY_PRIME_ENABLED, DEALROOM_ENABLED -->
Rollout:
- [ ] Default OFF (safe) OR gated by environment
Rollback:
- [ ] Disable flag OR revert PR (no data loss)

## Security / Credentials
- [ ] No secrets committed
- [ ] Any new credentials are references only (Secret Manager / GitHub Secrets)
- [ ] Policy/registry updated if new tool/connector added
- [ ] Least privilege enforced (deny-by-default)

## Evidence of Correctness (mandatory)
Provide one of:
- [ ] Test output excerpt (short)
- [ ] Screenshot / artifact link
- [ ] Sample API responses (sanitized)

## Decisions Logged
- [ ] `docs/system/DECISIONS.md` updated if any non-trivial default was chosen

## Definition of DONE (for this PR)
- [ ] All gates green
- [ ] TODO status updated (TODO.yaml + TODO_STATUS.json)
- [ ] VALIDATION_LOG.md and EXECUTION_LOG.md updated (or artifact links provided if nondeterministic)
