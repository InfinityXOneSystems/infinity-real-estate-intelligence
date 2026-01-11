# Auto-Keep & Auto-Approve Features Guide

## Overview

The autonomous agent now includes **Auto-Keep** and **Auto-Approve** capabilities that eliminate the need for manual confirmation prompts. The system runs completely unattended with all decisions automatically made.

---

## Features

### Auto-Approve
**Purpose:** Automatically approves all fix and optimization operations without requiring manual confirmation.

**Applies To:**
- Installing dependencies (`npm install`)
- Building TypeScript (`npm run build`)
- Type checking (`npm run typecheck`)
- Linting checks (`npm run lint`)
- Package auditing (`npm audit`)
- Security scans

**Behavior:**
- When enabled (default), all approval prompts are automatically answered with "YES"
- All actions are logged with `autoApproved: true` flag
- Decisions are recorded in JSON reports for audit trail

### Auto-Keep
**Purpose:** Automatically keeps recovery and healing operations without requiring manual confirmation to retain changes.

**Applies To:**
- Cache cleaning and reinstallation
- Build directory reset and rebuild
- Module integrity verification
- File system cleanup operations

**Behavior:**
- When enabled (default), all keep/retain prompts are automatically answered with "KEEP"
- All recovery operations are logged with `autoKept: true` flag
- Changes are automatically persisted without user confirmation

---

## Usage

### Enable Both (Default - Fully Autonomous)
```powershell
npm run autonomous:full-cycle
```
Both Auto-Keep and Auto-Approve are enabled by default.

### Run with Specific Settings
```powershell
# Enable both (same as default)
powershell -File scripts/autonomous-agent.ps1 -Mode full-cycle -AutoApprove -AutoKeep

# Run with AutoApprove only
powershell -File scripts/autonomous-agent.ps1 -Mode fix -AutoApprove

# Run with AutoKeep only
powershell -File scripts/autonomous-agent.ps1 -Mode heal -AutoKeep
```

### Disable for Manual Control (Not Recommended)
```powershell
# Disable all auto features (requires manual approval)
powershell -File scripts/autonomous-agent.ps1 -Mode full-cycle -AutoApprove:$false -AutoKeep:$false
```

---

## Command Reference

| Command | Auto-Approve | Auto-Keep | Effect |
|---------|--------------|-----------|--------|
| `npm run autonomous:full-cycle` | ✅ YES | ✅ YES | **RECOMMENDED**: Fully autonomous, no prompts |
| `npm run autonomous:diagnose` | ✅ YES | ✅ YES | Diagnose with auto-approval |
| `npm run autonomous:fix` | ✅ YES | ✅ YES | Fix with auto-approval |
| `npm run autonomous:heal` | ✅ YES | ✅ YES | Heal with auto-keep |
| `npm run autonomous:optimize` | ✅ YES | ✅ YES | Optimize with auto-approval |
| `npm run autonomous:enhance` | ✅ YES | ✅ YES | Enhance with auto-approval |
| `npm run autonomous:monitor` | ✅ YES | ✅ YES | Continuous 24/7 operation |

---

## Auto-Validation

After each operation (analyze, diagnose, fix, heal, optimize, enhance), the system automatically validates:

1. **File Integrity**
   - JSON syntax validation (package.json, tsconfig.json)
   - Configuration file checks

2. **Environment Health**
   - Node.js and npm availability
   - TypeScript compilation status

3. **Dependencies**
   - node_modules existence
   - Package installation status

4. **Build Artifacts**
   - dist/ directory presence
   - Build file count and integrity

5. **Configuration**
   - Environment variables (.env)
   - Required configuration files

**Validation Reports Include:**
- Step-specific checks
- Status indicators (VALID, INVALID, MISSING)
- Issue tracking with details
- Timestamp and context information

---

## Execution Flow

### Full-Cycle with Auto-Features
```
1. AUTO-ANALYSIS
   ├─ Project structure analysis
   ├─ Dependency checking
   ├─ Configuration validation
   ├─ Git status review
   └─ [AUTO-VALIDATE] ✅

2. AUTO-DIAGNOSIS
   ├─ Environment checks
   ├─ Docker status
   ├─ Package installation status
   ├─ Build artifacts verification
   ├─ Environment variables check
   └─ [AUTO-VALIDATE] ✅

3. AUTO-FIX (AUTO-APPROVE)
   ├─ Install dependencies [APPROVED ✓]
   ├─ Build TypeScript [APPROVED ✓]
   ├─ Type checking [APPROVED ✓]
   ├─ Linting [APPROVED ✓]
   └─ [AUTO-VALIDATE] ✅

4. AUTO-HEAL (AUTO-KEEP)
   ├─ Clean cache & reinstall [KEPT ✓]
   ├─ Reset & rebuild [KEPT ✓]
   ├─ Verify integrity [KEPT ✓]
   └─ [AUTO-VALIDATE] ✅

5. AUTO-OPTIMIZE
   ├─ Audit dependencies [APPROVED ✓]
   ├─ Analyze build size [APPROVED ✓]
   ├─ Source file analysis [APPROVED ✓]
   └─ [AUTO-VALIDATE] ✅

6. AUTO-ENHANCE
   ├─ Documentation check [APPROVED ✓]
   ├─ Test coverage review [APPROVED ✓]
   ├─ Monitoring setup [APPROVED ✓]
   ├─ API documentation [APPROVED ✓]
   └─ [AUTO-VALIDATE] ✅
```

---

## Logging & Audit Trail

All auto-decisions are fully logged:

### Log File Location
```
logs/autonomous/autonomous_YYYYMMDD_HHMMSS.log
```

### Sample Log Entries
```
[2025-12-11 01:44:28] [INFO] Auto-Approve: Approving install dependencies in confirmation
[2025-12-11 01:46:34] [INFO] Auto-Approve: Approving rebuild TypeScript in confirmation
[2025-12-11 01:46:56] [INFO] Auto-Keep: Approving clean cache and reinstall in confirmation
```

### Report File Location
```
reports/autonomous/analysis_YYYYMMDD_HHMMSS.json
```

### Report Includes Auto-Flags
```json
{
  "fixes": [
    {
      "name": "Install Dependencies",
      "action": "npm install",
      "status": "SUCCESS",
      "autoApproved": true
    }
  ],
  "recoveries": [
    {
      "name": "Clean Cache & Reinstall",
      "status": "SUCCESS",
      "autoKept": true
    }
  ]
}
```

---

## Safety & Security

### Auto-Features Are Safe Because:

✅ **Non-Destructive Default**
- All operations are reversible
- Original files backed up before changes
- Dependencies locked via package-lock.json

✅ **Fully Logged**
- Every decision recorded with timestamp
- Complete audit trail in JSON reports
- Verbose logging available

✅ **Validation After Each Step**
- System validates all changes
- Issues identified and reported
- Integrity checks performed

✅ **Configurable**
- Can be disabled if needed
- Dry-run mode available for testing
- Manual mode still available

✅ **Intelligent Decision Making**
- Only performs necessary operations
- Checks before taking action
- Respects existing configurations

---

## Best Practices

### 1. Use Full-Cycle for Production
```powershell
npm run autonomous:full-cycle
```
Runs all 6 modules with all validations and auto-features.

### 2. Schedule for Regular Maintenance
```powershell
npm run autonomous:monitor
```
Runs continuously every 6 hours (configurable).

### 3. Monitor Reports Regularly
Check `reports/autonomous/` for JSON reports showing system health.

### 4. Review Logs for Issues
Check `logs/autonomous/` for detailed execution logs.

### 5. Integration with CI/CD
```bash
# Perfect for automated pipelines
npm run autonomous:full-cycle

# Capture results
$report = Get-Content reports/autonomous/latest-report.json | ConvertFrom-Json

# Fail pipeline if validation issues
if ($report.modules.validation.status -contains "failed") { exit 1 }
```

---

## Troubleshooting

### System Runs Too Fast
- Check logs to ensure operations are completing successfully
- Auto-features speed up execution significantly
- Validate reports for any issues

### Want to Review Before Approval
```powershell
# Run with verbose output
npm run autonomous:full-cycle -Verbose
```

### Want Manual Control for Specific Operation
```powershell
# Run individual module with validation only
npm run autonomous:diagnose
```

### Disable Auto-Features for Debugging
```powershell
powershell -File scripts/autonomous-agent.ps1 -Mode full-cycle -AutoApprove:$false -AutoKeep:$false -Verbose
```

---

## Summary

| Feature | Enabled | Effect | Logs |
|---------|---------|--------|------|
| Auto-Approve | ✅ Default | No FIX prompts | autoApproved: true |
| Auto-Keep | ✅ Default | No KEEP prompts | autoKept: true |
| Auto-Validate | ✅ Always | Validation after each step | validation object |
| Logging | ✅ Always | Complete audit trail | autonomous_*.log |
| Reporting | ✅ Always | JSON reports generated | analysis_*.json |

**Result:** Fully autonomous, zero-touch system that maintains complete audit trail and validation.

---

## Next Steps

1. **Start the System**
   ```powershell
   npm run autonomous:full-cycle
   ```

2. **Check the Reports**
   ```powershell
   Get-Content reports/autonomous/latest-report.json | ConvertFrom-Json | Format-List
   ```

3. **Review the Logs**
   ```powershell
   Get-Content logs/autonomous/latest.log | Select-Object -Last 50
   ```

4. **Enable Continuous Monitoring**
   ```powershell
   npm run autonomous:monitor
   ```

---

**Status:** ✅ **PRODUCTION READY**

The system is fully autonomous, fully validated, and fully logged. Run with confidence!
