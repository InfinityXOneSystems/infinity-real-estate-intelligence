# AUTO-VALIDATE-TAG-PUSH AGENT
**Index:** 4.A.1 → 4.B.1 → 4.C.2  
**Status:** READY FOR DEPLOYMENT  
**See:** SYSTEM_MANIFEST.md (6.C.1.1) for mandatory requirements

---

## 📋 Overview

Three-stage autonomous agent that validates code, creates semantic version tags, and automatically pushes to remote repository after successful validation.

### Agent Pipeline
```
Code Validator (4.A.1)
    ↓ (validation passes)
Git Pusher (4.B.1)
    ↓ (committed and tagged)
Document Evolution (4.C.2)
    ↓ (index updated)
✅ COMPLETE
```

---

## 🚀 Quick Start

### Option 1: PowerShell (Windows - RECOMMENDED)
```powershell
# Navigate to repo
cd C:\Users\JARVIS\OneDrive\Documents\docker_llm

# Run with default settings (patch bump)
.\invoke_auto_validate_push.ps1

# Run with minor version bump
.\invoke_auto_validate_push.ps1 -BumpType minor

# Dry run (no commits)
.\invoke_auto_validate_push.ps1 -DryRun
```

### Option 2: Python Direct
```bash
cd /path/to/docker_llm
python auto_validate_tag_push_agent.py
```

### Option 3: GitHub Actions (Automatic)
Agent runs automatically on:
- Push to `main` branch
- Push to `develop` branch
- Manual workflow dispatch

---

## 📊 Agent Stages

### Stage 1: Code Validator (Index: 4.A.1)

**Validations:**
- `4.A.1.1` - Syntax validation (Python AST, JSON parsing)
- `4.A.1.2` - Import checking (dependency verification)
- `4.A.1.3` - Style validation (line length, whitespace)
- `4.A.1.4` - Docstring validation (function/class docs)

**Input:** All `.py` and `.json` files (excluding `.venv`, `.git`, etc.)

**Output:** Validation report with pass/fail status

**Failure Action:** ABORT pipeline, log errors, exit with code 1

**Example Output:**
```
[4.A.1.1] Validating syntax: auto_validate_tag_push_agent.py
[4.A.1.2] Validating imports: auto_validate_tag_push_agent.py
[4.A.1.3] Validating style: auto_validate_tag_push_agent.py
[4.A.1.4] Validating docstrings: auto_validate_tag_push_agent.py
[4.A.1] Validation complete: 5/5 files valid
```

---

### Stage 2: Git Pusher (Index: 4.B.1)

**Operations:**
- `4.B.1.1` - Stage changes (`git add -A`)
- `4.B.1.2` - Create semantic version tag (v*.*.*)
- `4.B.1.3` - Push to remote (`git push origin main`)

**Requirements:**
- Valid git configuration (`user.email`, `user.name`)
- SSH keys or credentials configured
- Main branch exists in origin
- Clean working tree before execution

**Semantic Versioning:**
```
Current: v1.2.3
Bump patch → v1.2.4
Bump minor → v1.3.0
Bump major → v2.0.0
```

**Example Output:**
```
[4.B.1.1] Staging changes...
[4.B.1.1] Changes staged
[4.B.1.2] Creating commit...
[4.B.1.2] Committing: ✅ Validated 5 files (4.A.1 → 4.B.1 → 4.C.2)
[4.B.1.2] Commit created
[4.B.1.2] Creating tag: v1.2.4
[4.B.1.3] Pushing to origin/main...
[4.B.1.3] Pushed to origin/main
[4.B.1.3] Tags pushed
```

---

### Stage 3: Document Evolution (Index: 4.C.2)

**Operations:**
- `4.C.2.1` - Detect code changes (git diff)
- `4.C.2.2` - Update ENTERPRISE_INDEX.md and TASK_MANIFEST.json
- `4.C.2.3` - Sync to cloud (Google Drive API - ready for integration)

**Files Updated:**
1. **ENTERPRISE_INDEX.md** - Appends validation log entry
2. **TASK_MANIFEST.json** - Updates validation_history (last 10 entries)

**Example TASK_MANIFEST Entry:**
```json
{
  "timestamp": "2025-12-11T14:30:00.123456",
  "version": "v1.2.4",
  "status": "validated",
  "agent_pipeline": "4.A.1 → 4.B.1 → 4.C.2"
}
```

---

## 🔧 Configuration

### Environment Variables
```powershell
# Override repo path (default: current directory)
$env:REPO_PATH = "C:\Users\JARVIS\OneDrive\Documents\docker_llm"
```

### Git Configuration (REQUIRED)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global push.default current
```

### GitHub Actions Secrets (Optional)
If using GitHub Actions, add secrets for:
- `GH_TOKEN` (GitHub Personal Access Token)
- `GOOGLE_DRIVE_API_KEY` (for cloud sync)

---

## 📝 Logging

### Log Output
**File:** `auto_validate_push.log` (persistent)  
**Console:** Real-time streaming

### Log Format
```
2025-12-11 14:30:00 [INFO] [4.A.1.1] Validating syntax: auto_validate_tag_push_agent.py
2025-12-11 14:30:01 [INFO] [4.B.1.1] Staging changes...
2025-12-11 14:30:02 [INFO] [4.C.2.2] Updating manifest...
```

### Log Retention
- Last 10 validation records in TASK_MANIFEST.json
- Full logs in auto_validate_push.log
- Archive logs older than 30 days (optional)

---

## ✅ Verification Checklist

### Before Running Agent
- [ ] Python 3.9+ installed
- [ ] `.venv` virtual environment exists
- [ ] Git configured (`user.name`, `user.email`)
- [ ] SSH keys working (test: `ssh -T git@github.com`)
- [ ] Main branch exists in origin
- [ ] No uncommitted changes (`git status`)
- [ ] ENTERPRISE_INDEX.md exists
- [ ] TASK_MANIFEST.json exists
- [ ] LIVE_TASK_TRACKER.md exists

### After Running Agent
- [ ] Validation report generated (success)
- [ ] Commits pushed to origin
- [ ] Tags visible in GitHub (`git tag -l`)
- [ ] ENTERPRISE_INDEX.md has new validation entry
- [ ] TASK_MANIFEST.json updated with validation_history
- [ ] Log file contains all stages (4.A.1, 4.B.1, 4.C.2)

---

## 🐛 Troubleshooting

### "Python not found"
```powershell
# Check Python is in PATH
python --version

# Or use full path to .venv
C:\Users\JARVIS\OneDrive\Documents\docker_llm\.venv\Scripts\python.exe auto_validate_tag_push_agent.py
```

### "Git configuration incomplete"
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### "Nothing to commit"
- This is normal if no changes exist
- Agent handles gracefully and continues

### "Push failed"
```bash
# Check remote configuration
git remote -v

# Test SSH access
ssh -T git@github.com

# Verify credentials/tokens
```

### "Validation errors"
Check `auto_validate_push.log` for details:
```powershell
Get-Content auto_validate_push.log -Tail 50
```

---

## 📊 Success Indicators

### Console Output
```
✅ Validation passed: 5/5 files valid
✅ Changes staged
✅ Commit created
✅ Tag created: v1.2.4
✅ Pushed to origin/main
✅ Tags pushed
✅ Manifest updated
✅ PIPELINE COMPLETE
```

### Git Log
```bash
git log --oneline | head -1
# Output: abc1234 ✅ Validated 5 files (4.A.1 → 4.B.1 → 4.C.2)

git tag | tail -1
# Output: v1.2.4
```

### Files Updated
```bash
# Check index
tail ENTERPRISE_INDEX.md | grep "Validation Entry"

# Check manifest
python -c "import json; m=json.load(open('TASK_MANIFEST.json')); print(m['validation_history'][-1])"
```

---

## 🔐 Security Considerations

### NEVER
- ❌ Use `--force` flag on git push
- ❌ Commit to `main` with failing validation
- ❌ Hardcode credentials in scripts
- ❌ Skip validation stages

### DO
- ✅ Use SSH keys for git authentication
- ✅ Review logs before pushing
- ✅ Store credentials in environment variables
- ✅ Enable branch protection on main

---

## 📚 Related Files

| File | Index | Purpose |
|------|-------|---------|
| SYSTEM_MANIFEST.md | 6.C.1.1 | Mandatory requirements |
| ENTERPRISE_INDEX.md | 6.A.3 | Master index (6 levels) |
| TASK_MANIFEST.json | 5.A | Task definitions |
| LIVE_TASK_TRACKER.md | 5.A.1 | Real-time dashboard |
| auto_validate_tag_push_agent.py | 4.A-4.C | Agent implementation |
| invoke_auto_validate_push.ps1 | 4.A-4.C | PowerShell wrapper |
| auto-validate-tag-push.yml | 4.A-4.C | GitHub Actions workflow |

---

## 📞 Examples

### Example 1: Local Validation with Patch Bump
```powershell
cd C:\Users\JARVIS\OneDrive\Documents\docker_llm
.\invoke_auto_validate_push.ps1
# Result: Validates code, tags v1.0.0 → v1.0.1, pushes to origin/main
```

### Example 2: Minor Version Bump
```powershell
.\invoke_auto_validate_push.ps1 -BumpType minor
# Result: Tags v1.0.1 → v1.1.0
```

### Example 3: Dry Run (No Commits)
```powershell
.\invoke_auto_validate_push.ps1 -DryRun
# Result: Validates code only, no git operations
```

### Example 4: GitHub Actions Automatic
```
Push to main → GitHub Actions triggered
  ↓
Run auto_validate_tag_push_agent.py
  ↓
All stages complete
  ↓
Comment added to PR: "✅ Auto Validation Passed"
```

---

## 🎯 Integration Points

### With Real Estate Intelligence System
- Index references: 4.A.1 → 4.B.1 → 4.C.2
- Document lifecycle: INGEST → TRANSFORM → EVOLVE → CREATE → SYNC
- Task tracking: TASK_MANIFEST.json (5.A)
- Live monitoring: LIVE_TASK_TRACKER.md (5.A.1)

### With CI/CD Pipeline
- Trigger: GitHub Actions on push to main/develop
- Execution: Python agent + PowerShell wrapper
- Output: Validation logs + git tags
- Next stage: Deploy or promote to production

---

## 📈 Monitoring & Metrics

**Track Over Time:**
- Validation pass rate
- Average pipeline execution time
- Number of tags created per week
- Files committed per release

**View Metrics:**
```bash
# Count successful validations
grep "PIPELINE COMPLETE" auto_validate_push.log | wc -l

# List all tags created
git tag -l --sort=-version:refname | head -10

# Show validation history
python -c "import json; [print(h) for h in json.load(open('TASK_MANIFEST.json'))['validation_history']]"
```

---

**Agent Status:** ✅ READY  
**Last Updated:** 2025-12-11  
**Maintainer:** System Architecture  
**See Also:** SYSTEM_MANIFEST.md (6.C.1.1) - Mandatory Requirements
