import logging

#!/usr/bin/env python3
"""
Real Estate Intelligence - Autonomous Agent System Launcher
============================================================
This script provides a simple way to launch the autonomous agent system
with different configurations and modes.

Usage:
    python3 launch.py --mode full-cycle
    python3 launch.py --mode monitor
    python3 launch.py --mode diagnose
"""

import sys
import subprocess
import os
import json
from pathlib import Path
from datetime import datetime

# Color codes for terminal output
class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

    logging.info(f"\n{Colors.CYAN}{Colors.BOLD}")
    """Print system header"""
    logging.info(f"\n{Colors.CYAN}{Colors.BOLD}")
    logging.info("╔════════════════════════════════════════════════════════════════╗")
    logging.info("║  🤖 REAL ESTATE INTELLIGENCE - AUTONOMOUS AGENT LAUNCHER       ║")
    logging.info("╚════════════════════════════════════════════════════════════════╝")
    logging.info(f"{Colors.RESET}\n")

def print_usage():
    """Print usage information"""
    logging.info(f"{Colors.YELLOW}USAGE:{Colors.RESET}")
    logging.info("  npm run autonomous:full-cycle    # Run once")
    logging.info("  npm run autonomous:monitor       # Run continuously (every 6 hours)")
    logging.info("  npm run autonomous:diagnose      # Diagnose issues")
    logging.info("  npm run autonomous:fix           # Fix problems")
    logging.info("  npm run autonomous:heal          # Recover from errors")
    logging.info("  npm run autonomous:optimize      # Optimize performance")
    logging.info("  npm run autonomous:enhance       # Get recommendations")
    logging.info("")

def check_environment():
    """Check if Node.js and npm are available"""
    logging.info(f"{Colors.YELLOW}Checking environment...{Colors.RESET}")
    
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        node_version = result.stdout.strip()
        logging.info(f"  ✅ Node.js: {node_version}")
    except FileNotFoundError:
        logging.info(f"  ❌ Node.js not found. Please install Node.js from https://nodejs.org")
        return False
    
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        npm_version = result.stdout.strip()
        logging.info(f"  ✅ npm: {npm_version}")
    except FileNotFoundError:
        logging.info(f"  ❌ npm not found. Please install npm.")
        return False
    
    logging.info()
    return True

def get_autonomous_status():
    """Get status of autonomous system"""
    project_root = Path.cwd()
    
    logs_dir = project_root / "logs" / "autonomous"
    reports_dir = project_root / "reports" / "autonomous"
    
    logging.info(f"{Colors.BLUE}System Status:{Colors.RESET}")
    
    # Check logs
    if logs_dir.exists():
        log_files = list(logs_dir.glob("*.log"))
        if log_files:
            latest_log = max(log_files, key=lambda p: p.stat().st_mtime)
            logging.info(f"  ✅ Latest Log: {latest_log.name}")
        else:
            logging.info(f"  ⓘ No logs yet (system hasn't run)")
    else:
        logging.info(f"  ⓘ No logs yet (system hasn't run)")
    
    # Check reports
    if reports_dir.exists():
        report_files = list(reports_dir.glob("*.json"))
        if report_files:
            latest_report = max(report_files, key=lambda p: p.stat().st_mtime)
            logging.info(f"  ✅ Latest Report: {latest_report.name}")
            
            # Try to read summary from latest report
            try:
                with open(latest_report, 'r') as f:
                    data = json.load(f)
                    if 'summary' in data:
                        summary = data['summary']
                        logging.info(f"      • Modules: {summary.get('successfulModules', 0)}/{summary.get('totalModules', 0)} successful")
                        logging.info(f"      • Issues: {summary.get('issuesFound', 0)} found")
            except:
                pass
        else:
            logging.info(f"  ⓘ No reports yet (system hasn't run)")
    else:
        logging.info(f"  ⓘ No reports yet (system hasn't run)")
    
    logging.info()

def run_command(mode):
    """Run the autonomous agent in specified mode"""
    logging.info(f"{Colors.GREEN}Starting Autonomous Agent: {mode.upper()}{Colors.RESET}\n")
    
    cmd = f"npm run autonomous:{mode}"
    
    try:
        subprocess.run(cmd, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        logging.info(f"{Colors.RED}Error running command: {e}{Colors.RESET}")
        return False
    except KeyboardInterrupt:
        logging.info(f"\n{Colors.YELLOW}Interrupted by user{Colors.RESET}")
        return False
    
    return True

def main():
    """Main entry point"""
    print_header()
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    # Get current status
    get_autonomous_status()
    
    # Show available commands
    logging.info(f"{Colors.GREEN}Available Commands:{Colors.RESET}")
    logging.info()
    logging.info("  1. Full Cycle       npm run autonomous:full-cycle")
    logging.info("  2. Monitor          npm run autonomous:monitor")
    logging.info("  3. Diagnose         npm run autonomous:diagnose")
    logging.info("  4. Fix Issues       npm run autonomous:fix")
    logging.info("  5. Heal             npm run autonomous:heal")
    logging.info("  6. Optimize         npm run autonomous:optimize")
    logging.info("  7. Enhance          npm run autonomous:enhance")
    logging.info()
    
    # Interactive mode
    if len(sys.argv) == 1:
        logging.info(f"{Colors.CYAN}Quick start: npm run autonomous:full-cycle{Colors.RESET}")
        logging.info(f"{Colors.CYAN}Or run:      npm run autonomous:monitor (continuous){Colors.RESET}")
        logging.info()
        logging.info(f"{Colors.YELLOW}For details, see: README_AUTONOMOUS.md{Colors.RESET}\n")
        return 0
    
    # Command line mode
    if len(sys.argv) >= 2:
        mode = sys.argv[1].replace("--mode=", "")
        if mode.startswith("--mode "):
            mode = mode[7:]
        
        valid_modes = ['full-cycle', 'monitor', 'diagnose', 'fix', 'heal', 'optimize', 'enhance', 'agent', 'scheduler']
        
        if mode not in valid_modes:
            logging.info(f"{Colors.RED}Invalid mode: {mode}{Colors.RESET}")
            logging.info(f"Valid modes: {', '.join(valid_modes)}")
            return 1
        
        run_command(mode)
    
    return 0

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
