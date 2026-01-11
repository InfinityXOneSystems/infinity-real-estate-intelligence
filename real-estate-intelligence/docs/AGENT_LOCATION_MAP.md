# ⚠️ AGENT DEPLOYMENT LOCATION MAP

## Current Incorrect State
The following files were created in the WRONG location (docker_llm):
- auto_validate_tag_push_agent.py
- AUTO_VALIDATE_AGENT_README.md
- SYSTEM_MANIFEST.md
- SYSTEM_REQUIREMENTS.json
- QUICK_REFERENCE.md
- IMPLEMENTATION_SUMMARY.md
- FILE_MANIFEST_INDEX.md
- DEPLOYMENT_CHECKLIST.md
- invoke_auto_validate_push.ps1

**Status:** ❌ NEEDS TO BE MOVED TO REAL_ESTATE_INTELLIGENCE

---

## CORRECT DEPLOYMENT LOCATIONS

### Real_estate_Intelligence Workspace
**Path:** `C:\Users\JARVIS\OneDrive\Documents\Real_estate_Intelligence\`

#### Enterprise Agents Directory (Index: 4.A-4.C)
**Path:** `enterprise/06-AGENTS/`

Files MUST be moved to:
```
enterprise/06-AGENTS/
├── CODE-VALIDATOR/
│   ├── auto_validate_tag_push_agent.py        [MOVE HERE]
│   ├── validate_agent_config.json             [CREATE]
│   └── README.md                              [MOVE HERE]
│
├── GIT-PUSHER/
│   ├── git_operations_config.json             [CREATE]
│   └── README.md                              [CREATE]
│
└── DOC-EVOLVE/
    ├── index_sync_config.json                 [CREATE]
    └── README.md                              [CREATE]
```

---

## SYSTEM MANIFEST LOCATION

**MUST BE IN:** `enterprise/SYSTEM_MANIFEST.md`

This is the MASTER reference that all agents consult:
- **What:** Enterprise system requirements
- **Tech Stack:** Python 3.11+, Git, PowerShell 5.1+
- **AI Stack:** Claude Haiku 4.5
- **Dependencies:** ast, subprocess, json, pathlib
- **Index Reference:** 6.A (Blueprints)

---

## QUICK REFERENCE LOCATION

**MUST BE IN:** `enterprise/QUICK_REFERENCE.md`

One-page guide for agents to understand:
1. System indexing (1.A-6.C)
2. Agent roles (4.A, 4.B, 4.C)
3. File locations
4. Execution flow

---

## ACTION ITEMS

### IMMEDIATE:
1. ❌ DELETE files from docker_llm folder
   - auto_validate_tag_push_agent.py
   - AUTO_VALIDATE_AGENT_README.md
   - SYSTEM_MANIFEST.md
   - SYSTEM_REQUIREMENTS.json
   - QUICK_REFERENCE.md
   - IMPLEMENTATION_SUMMARY.md
   - FILE_MANIFEST_INDEX.md
   - DEPLOYMENT_CHECKLIST.md
   - invoke_auto_validate_push.ps1

2. ✅ CREATE proper structure in Real_estate_Intelligence:
   ```
   Real_estate_Intelligence/
   └── enterprise/
       ├── 06-AGENTS/
       │   ├── CODE-VALIDATOR/
       │   │   ├── auto_validate_tag_push_agent.py
       │   │   ├── validate_config.json
       │   │   └── README.md
       │   ├── GIT-PUSHER/
       │   │   ├── git_operations.py
       │   │   ├── git_config.json
       │   │   └── README.md
       │   └── DOC-EVOLVE/
       │       ├── index_sync.py
       │       ├── sync_config.json
       │       └── README.md
       │
       └── SYSTEM_MANIFEST.md
       └── QUICK_REFERENCE.md
   ```

3. ✅ Move files to correct locations
4. ✅ Update all path references
5. ✅ Link to ENTERPRISE_INDEX.md (Index: 4.A-4.C)

---

## WHY THIS MATTERS

**Current Problem:**
- Agent code is in docker_llm (wrong project)
- System manifest files mixed with LLM infrastructure
- Agents can't find their config files
- Cross-references broken

**After Fix:**
- All agents in Real_estate_Intelligence/enterprise/06-AGENTS/
- System manifest at enterprise root (6.A reference)
- Clean separation: docker_llm = infrastructure, Real_estate_Intelligence = business logic
- Agents navigate via ENTERPRISE_INDEX.md

---

**NEXT STEP:** Move files to Real_estate_Intelligence and update all paths and references.
