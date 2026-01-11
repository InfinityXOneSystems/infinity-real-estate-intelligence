#!/bin/bash
# ============================================================================
# Autonomous Agent Startup Script
# ============================================================================
# This script initializes and starts the autonomous agent system
# Status: Production Ready - Full Autonomous Operation

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${PROJECT_ROOT}/logs/autonomous"
REPORT_DIR="${PROJECT_ROOT}/reports/autonomous"

# Ensure directories exist
mkdir -p "$LOG_DIR" "$REPORT_DIR"

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🤖 AUTONOMOUS AGENT SYSTEM - STARTUP${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================

echo -e "\n${YELLOW}📋 Running Pre-Flight Checks...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm ${NPM_VERSION}${NC}"

# Check TypeScript compiler
if ! command -v tsc &> /dev/null; then
    echo -e "${YELLOW}⚠️  TypeScript not found globally, will use local version${NC}"
fi

# Check node_modules
if [ ! -d "${PROJECT_ROOT}/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    cd "$PROJECT_ROOT"
    npm install
fi

echo -e "${GREEN}✅ Pre-Flight Checks Passed${NC}"

# ============================================================================
# BUILD CHECK & COMPILE
# ============================================================================

echo -e "\n${YELLOW}🔨 Checking Build...${NC}"

if [ ! -d "${PROJECT_ROOT}/dist" ]; then
    echo -e "${YELLOW}Building TypeScript...${NC}"
    npm run build
fi

echo -e "${GREEN}✅ Build Check Complete${NC}"

# ============================================================================
# START AUTONOMOUS AGENT
# ============================================================================

echo -e "\n${YELLOW}🚀 Starting Autonomous Agent...${NC}"

# Get startup mode from argument
MODE="${1:-monitor}"

case "$MODE" in
    "agent")
        echo -e "${BLUE}Starting TypeScript Autonomous Agent...${NC}"
        npm run autonomous:agent
        ;;
    "scheduler")
        echo -e "${BLUE}Starting Autonomous Scheduler (Cron-based)...${NC}"
        npm run autonomous:scheduler
        ;;
    "full-cycle")
        echo -e "${BLUE}Running Full Autonomous Cycle...${NC}"
        npm run autonomous:full-cycle
        ;;
    "monitor")
        echo -e "${BLUE}Starting Continuous Monitoring Mode...${NC}"
        echo -e "${YELLOW}This will run full cycles every 6 hours${NC}"
        npm run autonomous:monitor
        ;;
    "diagnose")
        echo -e "${BLUE}Running Diagnostic Mode...${NC}"
        npm run autonomous:diagnose
        ;;
    "fix")
        echo -e "${BLUE}Running Auto-Fix Mode...${NC}"
        npm run autonomous:fix
        ;;
    "heal")
        echo -e "${BLUE}Running Auto-Heal Mode...${NC}"
        npm run autonomous:heal
        ;;
    "optimize")
        echo -e "${BLUE}Running Optimization Mode...${NC}"
        npm run autonomous:optimize
        ;;
    "enhance")
        echo -e "${BLUE}Running Enhancement Mode...${NC}"
        npm run autonomous:enhance
        ;;
    *)
        echo -e "${RED}Unknown mode: $MODE${NC}"
        echo "Available modes: agent, scheduler, full-cycle, monitor, diagnose, fix, heal, optimize, enhance"
        exit 1
        ;;
esac

echo -e "\n${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Autonomous Agent System Started Successfully${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
