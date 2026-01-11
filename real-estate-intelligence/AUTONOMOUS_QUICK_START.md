# 🎯 AUTONOMOUS AGENT - QUICK REFERENCE

## ⚡ Start Here (Pick One)

### Just Run Once
```bash
npm run autonomous:full-cycle
```

### Run in Background (24/7)
```bash
npm run autonomous:monitor
```

### Specific Module
```bash
npm run autonomous:diagnose    # Find issues
npm run autonomous:fix         # Fix problems
npm run autonomous:optimize    # Improve performance
```

---

## 📋 Commands Cheat Sheet

```bash
# Full cycles
npm run autonomous:full-cycle           # Run once
npm run autonomous:monitor              # Continuous (every 6 hours)
npm run autonomous:agent                # TypeScript agent
npm run autonomous:scheduler            # Cron scheduler

# Individual modules
npm run autonomous:diagnose             # Diagnose issues
npm run autonomous:fix                  # Auto-fix problems
npm run autonomous:heal                 # Error recovery
npm run autonomous:optimize             # Performance tune
npm run autonomous:enhance              # Recommendations
```

---

## 🪟 Windows PowerShell

```powershell
# Full cycle once
.\scripts\autonomous-agent.ps1 -Mode full-cycle

# Specific module
.\scripts\autonomous-agent.ps1 -Mode diagnose
.\scripts\autonomous-agent.ps1 -Mode fix
.\scripts\autonomous-agent.ps1 -Mode heal

# Continuous monitoring
.\scripts\autonomous-agent.ps1 -Mode monitor

# Verbose output
.\scripts\autonomous-agent.ps1 -Mode full-cycle -Verbose

# Test without changes
.\scripts\autonomous-agent.ps1 -Mode fix -DryRun
```

---

## 📂 Check Results

```bash
# Latest log file
tail -20 logs/autonomous/scheduler.log

# View latest report
cat reports/autonomous/analysis-*.json | jq '.'

# Summary only
jq '.summary' reports/autonomous/analysis-*.json

# Error check
grep -i error logs/autonomous/*.log
```

---

## 🔄 Schedule (Automated)

| When | What | Command |
|------|------|---------|
| Now | Run once | `npm run autonomous:full-cycle` |
| Every 6h | Auto-run | `npm run autonomous:monitor` |
| Windows | Scheduled task | `.\scripts\autonomous-agent.ps1 -Mode monitor` |
| Linux/Mac | Crontab | `0 */6 * * * npm run autonomous:full-cycle` |
| Docker | Container | `docker run rei-autonomous npm run autonomous:scheduler` |

---

## 🚨 Troubleshooting Quick Fixes

| Problem | Fix |
|---------|-----|
| npm not found | `node --version` then install Node.js |
| Build failed | `npm install && npm run build` |
| Permission denied | `chmod +x scripts/*.sh` |
| Port in use | Try different machine or restart |
| High memory | Check: `npm run autonomous:optimize` |

---

## 📊 What Gets Checked

- ✅ Project structure
- ✅ Dependencies & vulnerabilities
- ✅ TypeScript compilation
- ✅ Code linting
- ✅ Build artifacts
- ✅ Environment variables
- ✅ Git status
- ✅ Node/npm versions
- ✅ Docker status
- ✅ File integrity

---

## 📁 Key Files

```
scripts/
├── autonomous-agent.ps1    ← Main PowerShell agent
├── startup.sh             ← Linux startup
└── startup.bat            ← Windows startup

src/autonomous/
├── agent.ts               ← TypeScript agent
└── scheduler.ts           ← Cron scheduler

logs/autonomous/           ← Execution logs
reports/autonomous/        ← Analysis reports

docs/
├── AUTONOMOUS_AGENT_GUIDE.md
├── DEPLOYMENT_GUIDE.md
└── IMPLEMENTATION_SUMMARY.md
```

---

## 🎯 Setup Options

### Option 1: Simple (Run Once)
```bash
cd C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence
npm run autonomous:full-cycle
```

### Option 2: Background (Windows)
```powershell
npm run autonomous:monitor
# Runs in terminal, or use Windows Task Scheduler
```

### Option 3: Automated (Windows Task Scheduler)
```powershell
# Create task (one-time setup)
# Then runs automatically every 6 hours
```

### Option 4: Docker
```bash
docker build -t rei .
docker run -d rei npm run autonomous:scheduler
```

---

## 📈 Performance

- **Time per cycle**: ~40 minutes
- **Frequency**: Every 6 hours (default)
- **Memory**: ~100-200MB
- **CPU**: Low (I/O bound)
- **Disk**: ~1-5MB per report

---

## 🔐 Security

- ✅ Local only (no external calls)
- ✅ Fully logged & auditable
- ✅ Credentials in .env (never exposed)
- ✅ Graceful error handling
- ✅ Dry-run mode available

---

## 🆘 Quick Help

```bash
# Show all autonomous commands
npm run | grep autonomous

# See logs
tail logs/autonomous/*.log

# See reports
ls reports/autonomous/

# Check processes
ps aux | grep autonomous

# Kill background process
pkill -f "autonomous:monitor"
```

---

## ✅ Success Indicators

After running:
- ✅ Report file created in `reports/autonomous/`
- ✅ Log file created in `logs/autonomous/`
- ✅ No error messages
- ✅ Summary shows modules completed

---

## 🚀 Go Live

1. **Test**: `npm run autonomous:full-cycle` (5 min)
2. **Enable**: `npm run autonomous:monitor` (1 min)
3. **Verify**: Check `logs/autonomous/` (2 min)
4. **Schedule**: Set up Task Scheduler or Cron (5 min)

**Total Setup Time**: ~15 minutes

---

**Status**: ✅ Ready to Use | Full Autonomous | 24/7 Operation

---

## 📞 Need Help?

See detailed docs:
- `docs/AUTONOMOUS_AGENT_GUIDE.md` - Complete guide
- `docs/DEPLOYMENT_GUIDE.md` - Deployment options
- `docs/IMPLEMENTATION_SUMMARY.md` - Full summary
