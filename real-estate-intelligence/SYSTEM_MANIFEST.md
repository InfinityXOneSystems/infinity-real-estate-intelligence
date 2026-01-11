# 🎯 REAL ESTATE INTELLIGENCE - SYSTEM MANIFEST
**Index:** 6.A.1 | **Version:** 2.0 | **Status:** ACTIVE  
**Workspace:** `C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence`

---

## 📋 MANDATORY SYSTEM REQUIREMENTS

### WORKSPACE CONFIGURATION
```
PRIMARY_WORKSPACE: C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence
SECONDARY_WORKSPACE: C:\Users\JARVIS\OneDrive\Documents\docker_llm (infrastructure only)
TERTIARY_WORKSPACE: C:\Users\JARVIS\OneDrive\Documents\vision_cortex (reference only)
```

### TECHNOLOGY STACK (MANDATORY)
| Component | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11+ | Agent runtime, validation, automation |
| PowerShell | 5.1+ | Command execution, scripting |
| Git | 2.40+ | Version control, tagging, commits |
| GitHub | Latest | Remote repository, CI/CD |
| JSON | Standard | Configuration files |
| Markdown | Standard | Documentation |

### AI STACK (MANDATORY)
| Component | Requirement |
|-----------|-------------|
| AI Model | Claude Haiku 4.5 |
| Agent Framework | Autonomous agents with index navigation |
| Context Window | Up to 200K tokens |
| Response Format | Structured JSON + Markdown |

### CODE LANGUAGE MANDATORIES
| Language | Use Case | Framework |
|----------|----------|-----------|
| Python | Core agents (4.A, 4.B, 4.C) | ast, subprocess, json, pathlib |
| PowerShell | Command wrapping, execution | Native Windows cmdlets |
| JSON | Configuration files | Standard schema |
| Markdown | Documentation, index | GitHub-flavored |

### DEPENDENCIES (MANDATORY)
```python
# Python Core (Built-in)
- ast              # Syntax validation
- subprocess       # Git operations, command execution
- json             # Config & manifest files
- pathlib          # Cross-platform path handling
- logging          # Audit trail
- datetime         # Timestamps
- re               # Pattern matching
- hashlib          # Checksums

# Optional (pip install if needed)
- GitPython        # Advanced git operations
- requests         # API calls
- google-auth      # Google Drive/Sheets sync
```

### REQUIREMENTS.TXT
```
Python>=3.11
GitPython>=3.1.0
requests>=2.28.0
google-auth>=2.0
google-auth-oauthlib>=0.8.0
google-auth-httplib2>=0.2.0
google-api-python-client>=2.0
```

---

## 🏗️ ENTERPRISE ARCHITECTURE (MANDATORY STRUCTURE)

### Directory Structure (Index Reference)
```
Real_estate_Intelligence/
├── 00-MASTER-INDEX/                    [Index: 1.A]
│   └── ENTERPRISE_INDEX.md             [Master control document]
│
├── 01-LEAD-GENERATION/                 [Index: 2.A]
│   ├── discovery.py
│   ├── scoring.py
│   └── nurturing.py
│
├── 02-CRM-WORKFLOW/                    [Index: 2.B]
│   ├── salesforce_sync.py
│   ├── hubspot_integration.py
│   └── pipeline_management.py
│
├── 03-ANALYTICS-INTELLIGENCE/          [Index: 2.C]
│   ├── conversion_model.py
│   ├── price_prediction.py
│   └── dashboards.py
│
├── 04-GOVERNANCE-COMPLIANCE/           [Index: 2.D]
│   ├── rbac_system.py
│   ├── audit_trail.py
│   └── compliance.py
│
├── 05-DOCUMENTS/                       [Index: 3.A-3.F]
│   ├── D-INDEX/                        [3.A]
│   ├── D-INGEST/                       [3.B]
│   ├── D-TRANSFORM/                    [3.C]
│   ├── D-EVOLVE/                       [3.D]
│   ├── D-CREATE/                       [3.E]
│   ├── D-SYNC/                         [3.F]
│   ├── TAXONOMY/
│   │   └── REAL_ESTATE_TAXONOMY.md
│   └── DOCUMENT_TEMPLATES.json
│
├── 06-AGENTS/                          [Index: 4.A-4.C] ⭐ PRIMARY FOCUS
│   ├── CODE-VALIDATOR/                 [Index: 4.A.1]
│   │   ├── auto_validate_tag_push_agent.py
│   │   ├── validate_config.json
│   │   ├── SYSTEM_MANIFEST.md          [MANDATORY - all requirements here]
│   │   └── README.md
│   │
│   ├── GIT-PUSHER/                     [Index: 4.B.1]
│   │   ├── git_operations.py
│   │   ├── git_config.json
│   │   └── README.md
│   │
│   └── DOC-EVOLVE/                     [Index: 4.C.2]
│       ├── index_sync.py
│       ├── sync_config.json
│       └── README.md
│
├── 07-TASKS/                           [Index: 5.A-5.B]
│   ├── TASK_MANIFEST.json              [5.A - all tasks indexed]
│   ├── LIVE_TASK_TRACKER.md            [5.A.1 - real-time dashboard]
│   └── PHASE_1_TASKS.md
│
├── .github/
│   ├── workflows/
│   │   ├── auto-validate-push.yml      [CI/CD trigger for 4.A-4.C]
│   │   ├── auto-tag-release.yml
│   │   └── sync-index.yml
│   └── instructions/
│
├── ENTERPRISE_INDEX.md                 [Index: 1.A + 6.A.3 - MASTER REFERENCE]
├── COMPLETE_CROSS_REFERENCE.md         [Index: 6.A.3 - all 150+ links]
├── INDEX_NAVIGATION.md                 [Index: 6.A.2 - how to navigate]
├── SYSTEM_MANIFEST.md                  [⭐ THIS FILE - all mandatories]
├── QUICK_REFERENCE.md                  [Index: 6.C.1 - agent quick start]
├── README.md                           [Project overview]
└── requirements.txt                    [Python dependencies]
```

---

## 🤖 AGENT SYSTEM (MANDATORY SETUP)

### Agent Architecture (Index: 4.A-4.C)
| Agent | Index | Function | Language | Location |
|-------|-------|----------|----------|----------|
| Code Validator | 4.A.1 | Syntax, imports, linting, docstrings | Python | 06-AGENTS/CODE-VALIDATOR/ |
| Git Pusher | 4.B.1 | Stage, commit, tag, push | Python + PowerShell | 06-AGENTS/GIT-PUSHER/ |
| Doc Evolution | 4.C.2 | Detect changes, update index, sync | Python | 06-AGENTS/DOC-EVOLVE/ |

### Agent Execution Flow (MANDATORY)
```
Code Validator (4.A.1)
  ├── 4.A.1.1: Syntax validation (ast.parse)
  ├── 4.A.1.2: Import validation (requirements check)
  ├── 4.A.1.3: Style validation (linting rules)
  ├── 4.A.1.4: Docstring validation (coverage check)
  └── Output: Validation report
       ↓
Git Pusher (4.B.1)
  ├── 4.B.1.1: Stage changes (git add -A)
  ├── 4.B.1.2: Create tag (semantic versioning)
  ├── 4.B.1.3: Create commit (AI-powered message)
  ├── 4.B.1.4: Push to remote (git push + tags)
  └── Output: Committed and tagged
       ↓
Doc Evolution (4.C.2)
  ├── 4.C.2.1: Detect changes (git diff)
  ├── 4.C.2.2: Update index (ENTERPRISE_INDEX.md)
  ├── 4.C.2.3: Sync metadata (TASK_MANIFEST.json)
  ├── 4.C.2.4: Cloud sync (Google Drive/Sheets)
  └── Output: System synchronized
```

---

## 📊 INDEX NAVIGATION (MANDATORY REFERENCE)

### Level 1: Strategic Planning (1.A-1.C)
```
1.A - Roadmap & Vision (4 phases, 24 weeks)
1.B - Governance Framework (RBAC, compliance, SLA)
1.C - System Analysis (tech stack, operations)
```

### Level 2: Domain Systems (2.A-2.D)
```
2.A - Lead Generation (discovery, scoring, nurturing)
2.B - CRM Workflow (Salesforce, HubSpot, pipeline)
2.C - Analytics (predictive, dashboards, reports)
2.D - Governance (access control, audit, security)
```

### Level 3: Document Management (3.A-3.F)
```
3.A - Classification (taxonomy, 24 templates)
3.B - Ingest (PDF, email, cloud import)
3.C - Transform (PDF→JSON, standardization, enrichment)
3.D - Evolve (versioning, enhancement, archival)
3.E - Create (contracts, CMA, reports, smart populate)
3.F - Sync (Google Drive, Sheets, CRM, BigQuery, webhooks)
```

### Level 4: Autonomous Agents (4.A-4.C)
```
4.A - Code Validator (syntax, imports, linting, docs) ⭐ PRIMARY
4.B - Git Pusher (stage, commit, tag, push) ⭐ PRIMARY
4.C - Doc Evolution (detect, update, sync) ⭐ PRIMARY
```

### Level 5: Task Execution (5.A-5.B)
```
5.A - Task Lifecycle (management, dependencies, tracking)
5.B - Roadmap Tasks (Phase 1-4, 10 tasks total)
```

### Level 6: Blueprints & Operations (6.A-6.C)
```
6.A - Architecture (10-tier, data flows, patterns) ← THIS FILE (6.A.1)
6.B - Deployment (IaC, CI/CD, scaling)
6.C - Operations (runbooks, troubleshooting, recovery)
```

---

## ⚙️ CONFIGURATION REQUIREMENTS (MANDATORY)

### Environment Variables (Required)
```powershell
$env:REPO_PATH = "C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence"
$env:AGENT_HOME = "$env:REPO_PATH\06-AGENTS"
$env:INDEX_FILE = "$env:REPO_PATH\ENTERPRISE_INDEX.md"
$env:TASK_MANIFEST = "$env:REPO_PATH\TASK_MANIFEST.json"
$env:GIT_USER = "JARVIS"
$env:GIT_EMAIL = "jarvis@realestate.ai"
```

### Git Configuration (Required)
```bash
git config user.name "JARVIS"
git config user.email "jarvis@realestate.ai"
git config core.autocrlf false
git config core.safecrlf false
```

### Python Virtual Environment (Required)
```powershell
# Activate .venv in Real_estate_Intelligence root
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

## 🔐 SECURITY MANDATORIES

| Requirement | Implementation |
|-------------|-----------------|
| No hardcoded secrets | Use environment variables only |
| Git credentials | GitHub token in .env (gitignored) |
| Audit trails | All operations logged with timestamps |
| File integrity | Checksums for critical files |
| Access control | Index-based RBAC (2.D.1.1) |
| Compliance | Disclosure docs (3.A.5.1) |

---

## ✅ INITIALIZATION CHECKLIST

- [ ] Workspace path set: `C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence`
- [ ] Directory structure created (00-MASTER-INDEX through 07-TASKS)
- [ ] ENTERPRISE_INDEX.md in place (Index: 1.A + 6.A.3)
- [ ] SYSTEM_MANIFEST.md in place (this file, Index: 6.A.1)
- [ ] Agent directories created: 06-AGENTS/CODE-VALIDATOR, GIT-PUSHER, DOC-EVOLVE
- [ ] requirements.txt created with all dependencies
- [ ] .venv configured with Python 3.11+
- [ ] Git configured with JARVIS credentials
- [ ] GitHub remote added (origin)
- [ ] CI/CD workflows in .github/workflows/
- [ ] All agents have config.json files
- [ ] Agents linked to ENTERPRISE_INDEX.md
- [ ] First test run successful (dry-run mode)

---

## 🚀 AGENT STARTUP COMMAND (MANDATORY)

### Run Full Validation → Tag → Push → Sync Pipeline
```powershell
# From Real_estate_Intelligence root
$env:REPO_PATH = "C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence"
cd $env:REPO_PATH
.\venv\Scripts\python.exe .\06-AGENTS\CODE-VALIDATOR\auto_validate_tag_push_agent.py
```

### Or via PowerShell Wrapper
```powershell
.\06-AGENTS\CODE-VALIDATOR\invoke_auto_validate_push.ps1 -BumpVersion "patch"
```

### Or via GitHub Actions (CI/CD)
```
Trigger: Push to main branch
Pipeline: auto-validate-push.yml
Flow: 4.A.1 → 4.B.1 → 4.C.2
```

---

## 📞 AGENT REFERENCE COMMANDS

| Agent | Command | Index |
|-------|---------|-------|
| Validate Code | `python 06-AGENTS/CODE-VALIDATOR/auto_validate_tag_push_agent.py` | 4.A.1 |
| Git Operations | `python 06-AGENTS/GIT-PUSHER/git_operations.py` | 4.B.1 |
| Sync Index | `python 06-AGENTS/DOC-EVOLVE/index_sync.py` | 4.C.2 |

---

## 🎯 IMMEDIATE IMPERATIVES

1. **Workspace**: Everything goes in `C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence`
2. **No Mixing**: Keep docker_llm and vision_cortex separate - they're reference/infrastructure only
3. **Index First**: Every file, agent, task must reference ENTERPRISE_INDEX.md (Index: 1.A or 6.A.3)
4. **Agents in 06-AGENTS**: All autonomous agents (4.A, 4.B, 4.C) live in `enterprise/06-AGENTS/`
5. **System Manifest**: This file is the MASTER reference - all agents consult it first
6. **Requirements Upfront**: Python 3.11+, PowerShell 5.1+, Git 2.40+, Claude Haiku 4.5
7. **No Forgotten Context**: Every agent/file includes index reference, location, purpose

---

**MANIFEST STATUS:** ✅ ACTIVE  
**LAST UPDATED:** 2025-12-11  
**MAINTAINED BY:** Document Evolution Agent (4.C.2)  
**REFERENCE:** ENTERPRISE_INDEX.md (Index: 1.A + 6.A.3)

*This is the MASTER reference document. If you're lost, start here.*
