# 🚀 Autonomous Agent Deployment Guide

## Quick Start - Choose Your Method

### ⚡ Method 1: Immediate Execution (Windows PowerShell)

```powershell
# Navigate to project
cd "C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence"

# Run full autonomous cycle immediately
.\scripts\autonomous-agent.ps1 -Mode full-cycle -Verbose

# View results
Get-Content logs/autonomous/*.log -Tail 50
Get-Content reports/autonomous/*.json | ConvertFrom-Json | Format-List
```

### ⚡ Method 2: Immediate Execution (npm command)

```bash
cd "C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence"

# Full cycle
npm run autonomous:full-cycle

# Or individual modules
npm run autonomous:diagnose
npm run autonomous:fix
npm run autonomous:optimize
```

### ⚡ Method 3: Start Continuous Monitoring

```powershell
# Keep running indefinitely, checking every 6 hours
npm run autonomous:monitor

# Or in PowerShell
.\scripts\autonomous-agent.ps1 -Mode monitor
```

---

## Production Deployment Options

### 🔷 Option A: Windows Task Scheduler (Recommended for Windows)

**Setup automated execution every 6 hours:**

```powershell
# Open PowerShell as Administrator
$taskName = "REI-Autonomous-Agent"
$taskPath = "\REI\"
$projectPath = "C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence"
$scriptPath = "$projectPath\scripts\autonomous-agent.ps1"

# Create trigger (every 6 hours)
$trigger = New-ScheduledTaskTrigger -At 2:00AM -Daily -RepetitionInterval (New-TimeSpan -Hours 6) -RepetitionDuration (New-TimeSpan -Days 365)

# Create action
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -Mode full-cycle"

# Create task
Register-ScheduledTask `
    -TaskName $taskName `
    -TaskPath $taskPath `
    -Trigger $trigger `
    -Action $action `
    -RunLevel Highest `
    -Force `
    -Description "Real Estate Intelligence - Autonomous Agent (Full Cycle every 6 hours)"

# Verify
Get-ScheduledTask -TaskName $taskName -TaskPath $taskPath | Get-ScheduledTaskInfo
```

**Other Scheduling Options:**

```powershell
# Every hour
$trigger = New-ScheduledTaskTrigger -At 12:00AM -Daily -RepetitionInterval (New-TimeSpan -Hours 1)

# Every 30 minutes
$trigger = New-ScheduledTaskTrigger -At 12:00AM -Daily -RepetitionInterval (New-TimeSpan -Minutes 30)

# Specific time daily
$trigger = New-ScheduledTaskTrigger -At 2:00AM -Daily

# At system startup
$trigger = New-ScheduledTaskTrigger -AtStartup
```

### 🐳 Option B: Docker Container (Cross-platform)

**Create Dockerfile:**

```dockerfile
# Dockerfile is already in your project
# Just build and run:

docker build -t rei-autonomous:latest .

# Run with automatic restart
docker run -d \
  --name rei-autonomous-agent \
  --restart always \
  -v "$(pwd)/logs:/app/logs" \
  -v "$(pwd)/reports:/app/reports" \
  rei-autonomous:latest \
  npm run autonomous:scheduler
```

**View logs:**
```bash
docker logs -f rei-autonomous-agent
```

### 🎯 Option C: npm Global Installation

**Install globally for easy access:**

```bash
# Install project as global command
npm install -g real-estate-intelligence

# Run from anywhere
rei-autonomous full-cycle
rei-autonomous monitor
```

### 📋 Option D: Cron Job (Linux/macOS)

**Edit crontab:**

```bash
# Open crontab editor
crontab -e

# Add these lines:

# Full cycle every 6 hours (0:00, 6:00, 12:00, 18:00)
0 */6 * * * cd /path/to/project && npm run autonomous:full-cycle >> logs/autonomous/cron.log 2>&1

# Health check every hour
0 * * * * cd /path/to/project && npm run autonomous:agent >> logs/autonomous/health.log 2>&1

# Weekly deep optimization (Sunday 3 AM)
0 3 * * 0 cd /path/to/project && npm run autonomous:optimize >> logs/autonomous/weekly.log 2>&1
```

### 🚀 Option E: PM2 Process Manager (Production)

**Install and configure:**

```bash
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'rei-autonomous',
      script: 'npm',
      args: 'run autonomous:scheduler',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      error_file: 'logs/autonomous/pm2-error.log',
      out_file: 'logs/autonomous/pm2-out.log',
      log_file: 'logs/autonomous/pm2-combined.log',
      time: true,
      env: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info'
      }
    }
  ]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save as startup service
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs rei-autonomous
```

### ☸️ Option F: Kubernetes Deployment

**Create deployment manifest:**

```yaml
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rei-autonomous-agent
  labels:
    app: rei-autonomous
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rei-autonomous
  template:
    metadata:
      labels:
        app: rei-autonomous
    spec:
      containers:
      - name: autonomous-agent
        image: rei-autonomous:latest
        imagePullPolicy: Always
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        volumeMounts:
        - name: logs
          mountPath: /app/logs
        - name: reports
          mountPath: /app/reports
        env:
        - name: LOG_LEVEL
          value: "info"
      volumes:
      - name: logs
        persistentVolumeClaim:
          claimName: rei-logs-pvc
      - name: reports
        persistentVolumeClaim:
          claimName: rei-reports-pvc
      restartPolicy: Always
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: rei-logs-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: rei-reports-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

**Deploy:**
```bash
kubectl apply -f kubernetes-deployment.yaml
kubectl logs -f deployment/rei-autonomous-agent
```

---

## Testing & Validation

### 1. Test Single Module
```bash
# Just check project structure
npm run autonomous:analyze

# Just diagnose issues
npm run autonomous:diagnose

# Try fixing without applying
.\scripts\autonomous-agent.ps1 -Mode fix -DryRun
```

### 2. Full Validation
```bash
# Run complete cycle with verbose output
npm run autonomous:full-cycle
# or
.\scripts\autonomous-agent.ps1 -Mode full-cycle -Verbose
```

### 3. Check Results
```bash
# View latest log
Get-Content logs/autonomous/*.log -Tail 100

# View latest report
Get-Content reports/autonomous/*.json | ConvertFrom-Json | Format-List

# Check summary
(Get-Content reports/autonomous/*.json | ConvertFrom-Json).summary
```

---

## Post-Deployment Verification

### ✅ Verify Installation

```bash
# Check that autonomous agent files exist
ls -la src/autonomous/
ls -la scripts/autonomous-agent.ps1

# Verify npm commands are registered
npm run --list | grep autonomous

# Test Node.js environment
node --version
npm --version
```

### ✅ Run First Cycle

```bash
# Execute and monitor
npm run autonomous:full-cycle

# Watch for output
# Should see: ANALYSIS → DIAGNOSIS → FIX → HEAL → OPTIMIZE → ENHANCE
```

### ✅ Check Logs and Reports

```bash
# Logs should be created
ls -la logs/autonomous/

# Reports should be created
ls -la reports/autonomous/

# Latest report should show success
jq '.summary' reports/autonomous/analysis-*.json | tail -1
```

### ✅ Enable Continuous Operation

```bash
# Start background monitoring
npm run autonomous:monitor &

# Or with nohup to survive logout
nohup npm run autonomous:monitor > logs/autonomous/nohup.log 2>&1 &

# Verify it's running
ps aux | grep autonomous
```

---

## Monitoring & Maintenance

### Daily Checks
```bash
# Check recent logs
tail -20 logs/autonomous/scheduler.log

# Check for errors
grep -i "error\|fail" logs/autonomous/*.log

# View latest statistics
jq '.summary' reports/autonomous/analysis-*.json | tail -5
```

### Weekly Maintenance
```bash
# Archive old logs
tar -czf logs/autonomous/archive-$(date +%Y%m%d).tar.gz logs/autonomous/*.log

# Check disk usage
du -sh logs/autonomous/ reports/autonomous/

# Verify schedule is still active (if using Windows Task Scheduler)
Get-ScheduledTask | Where-Object {$_.TaskName -like "*REI*"}
```

### Monthly Review
```bash
# Review all reports
Get-ChildItem reports/autonomous/*.json | ForEach-Object {
    $report = Get-Content $_.FullName | ConvertFrom-Json
    Write-Host "$($_.Name): $($report.summary.successfulModules)/$($report.summary.totalModules) modules"
}

# Check for patterns in failures
grep -A 2 "status.*failed" reports/autonomous/*.json
```

---

## Troubleshooting Deployments

### Issue: PowerShell Execution Policy
```powershell
# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run with bypass
powershell -ExecutionPolicy Bypass -File scripts/autonomous-agent.ps1
```

### Issue: npm Commands Not Found
```bash
# Rebuild npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Verify commands
npm run --list
```

### Issue: Docker Image Size
```bash
# Use multi-stage build
# The Dockerfile already includes optimizations

# Check image size
docker images rei-autonomous
```

### Issue: Logs Growing Too Large
```bash
# Manual cleanup (auto-cleanup runs weekly)
Remove-Item logs/autonomous/*.log -Force

# Or compress old logs
Get-ChildItem logs/autonomous/*.log | Where-Object {$_.CreationTime -lt (Get-Date).AddDays(-30)} | 
    ForEach-Object { Compress-Archive $_.FullName "$($_.FullName).zip" -Force }
```

---

## Performance Tuning

### Reduce Resource Usage
```json
// In scheduler.ts, increase interval
"IntervalSeconds": 3600  // 1 hour instead of 5 minutes
```

### Increase Monitoring Frequency
```bash
# Edit package.json script
"autonomous:monitor-frequent": "npm run autonomous:monitor -- --interval 600"
```

### Parallel Execution (Advanced)
```powershell
# Run multiple agents in parallel
$jobs = @()
$jobs += Start-Job { npm run autonomous:agent }
$jobs += Start-Job { npm run autonomous:optimize }
$jobs | Wait-Job
$jobs | Receive-Job
```

---

## Success Indicators

After deployment, you should see:

✅ **Logs being generated** - `logs/autonomous/` contains current date
✅ **Reports being created** - `reports/autonomous/` has JSON files
✅ **No errors** - Check logs have "COMPLETED" or "SUCCESS" messages
✅ **System running** - `ps aux | grep autonomous` shows process
✅ **Memory stable** - Around 100-200MB per cycle
✅ **Disk usage normal** - Reports ~1-5MB per report, old ones auto-deleted

---

## Next Steps

1. **Choose a deployment method** - Start with Option A (Windows Task Scheduler) for simplicity
2. **Run first cycle** - Test with `npm run autonomous:full-cycle`
3. **Enable continuous operation** - Use `npm run autonomous:monitor` or Task Scheduler
4. **Monitor results** - Check `logs/autonomous/` and `reports/autonomous/`
5. **Set up alerts** - Configure email/Slack notifications if desired

---

**Status**: ✅ Ready for Production | Full Autonomous Operation | Zero Manual Intervention Required
