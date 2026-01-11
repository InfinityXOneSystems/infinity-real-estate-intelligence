#!/usr/bin/env python3
"""
Vision Cortex - Interactive CLI Interface
Provides an interactive command-line interface for managing the entire system
Version: 1.0.0
"""

import argparse
import json
import sys
from pathlib import Path
from datetime import datetime
from unified_orchestrator import UnifiedOrchestrator
from auto_sop_agent import AutoSOPAgent
from sop_validator_refiner import SOPValidator, SOPRefiner


class VisionCortexCLI:
    """Interactive CLI for Vision Cortex"""
    
    def __init__(self, workspace_root: str = "."):
        """Initialize the CLI"""
        self.orchestrator = UnifiedOrchestrator(workspace_root)
        self.workspace_root = Path(workspace_root)
        self.sop_agent = AutoSOPAgent(workspace_root, Path(workspace_root) / "doc_system" / "sops")
        self.sop_validator = SOPValidator(validator_name="cli_validator")
        self.sop_refiner = SOPRefiner()
    
    def show_menu(self):
        """Display main menu"""
        print("\n" + "="*60)
        print("VISION CORTEX - UNIFIED SYSTEM")
        print("="*60)
        print("\n📚 DOCUMENTS")
        print("  1. Index a document")
        print("  2. Search documents")
        print("  3. Link documents")
        print("\n🗺️  ROADMAP")
        print("  4. Create roadmap item")
        print("  5. View roadmap progress")
        print("  6. Link document to roadmap")
        print("\n✅ TODOS")
        print("  7. Create todo")
        print("  8. Update todo")
        print("  9. View todo progress")
        print(" 10. Get todos by status")
        print("\n🔍 VALIDATION")
        print(" 11. Validate file")
        print(" 12. Validate directory")
        print(" 13. Validate and commit")
        print(" 14. View validation report")
        print("\n🔗 INTEGRATED WORK")
        print(" 15. Create complete work item (roadmap + todo + doc)")
        print(" 16. Complete work item")
        print(" 17. Get work item status")
        print("\n📋 SOP SYSTEM")
        print(" 22. List SOPs")
        print(" 23. Execute SOP")
        print(" 24. Create SOP from operations")
        print(" 25. Validate SOP")
        print(" 26. Refine SOP")
        print(" 27. View SOP metrics")
        print(" 28. View execution history")
        print(" 29. Export SOP report")
        print(" 30. Rebuild from SOP")
        print("\n📊 REPORTS")
        print(" 18. System status")
        print(" 19. Full system report")
        print(" 20. Export report to markdown")
        print("\n🏥 HEALTH")
        print(" 21. Health check")
        print("\n0. Exit")
        print("="*60)
    
    def run_interactive(self):
        """Run interactive CLI"""
        while True:
            self.show_menu()
            choice = input("\nEnter command number (0-30): ").strip()
            
            try:
                if choice == "0":
                    print("\n✅ Exiting Vision Cortex")
                    break
                elif choice == "1":
                    self._index_document()
                elif choice == "2":
                    self._search_documents()
                elif choice == "3":
                    self._link_documents()
                elif choice == "4":
                    self._create_roadmap_item()
                elif choice == "5":
                    self._view_roadmap_progress()
                elif choice == "6":
                    self._link_doc_to_roadmap()
                elif choice == "7":
                    self._create_todo()
                elif choice == "8":
                    self._update_todo()
                elif choice == "9":
                    self._view_todo_progress()
                elif choice == "10":
                    self._get_todos_by_status()
                elif choice == "11":
                    self._validate_file()
                elif choice == "12":
                    self._validate_directory()
                elif choice == "13":
                    self._validate_and_commit()
                elif choice == "14":
                    self._view_validation_report()
                elif choice == "15":
                    self._create_work_item()
                elif choice == "16":
                    self._complete_work_item()
                elif choice == "17":
                    self._get_work_item_status()
                elif choice == "18":
                    self._system_status()
                elif choice == "19":
                    self._full_system_report()
                elif choice == "20":
                    self._export_report()
                elif choice == "21":
                    self._health_check()
                elif choice == "22":
                    self._list_sops()
                elif choice == "23":
                    self._execute_sop()
                elif choice == "24":
                    self._create_sop_from_operations()
                elif choice == "25":
                    self._validate_sop()
                elif choice == "26":
                    self._refine_sop()
                elif choice == "27":
                    self._view_sop_metrics()
                elif choice == "28":
                    self._view_execution_history()
                elif choice == "29":
                    self._export_sop_report()
                elif choice == "30":
                    self._rebuild_from_sop()
                else:
                    print("❌ Invalid choice")
            
            except KeyboardInterrupt:
                print("\n\n⚠️  Interrupted by user")
                break
            except Exception as e:
                print(f"\n❌ Error: {str(e)}")
            
    def _index_document(self):
        """Index a document"""
        print("\n📚 INDEX DOCUMENT")
        doc_id = input("Document ID: ").strip()
        name = input("Document name: ").strip()
        path = input("File path: ").strip()
        doc_type = input("Type (markdown/json/plaintext/code): ").strip() or "markdown"
        description = input("Description: ").strip()
        tags = input("Tags (comma-separated): ").strip().split(",") if input("Tags (comma-separated): ").strip() else []
        
        # Read file content
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            
            success, message = self.orchestrator.index_document(
                doc_id, name, path, content, doc_type, description, tags
            )
            
            if success:
                print(f"\n✅ {message}")
            else:
                print(f"\n❌ {message}")
        
        except Exception as e:
            print(f"\n❌ Error reading file: {str(e)}")
    
    def _search_documents(self):
        """Search documents"""
        print("\n🔍 SEARCH DOCUMENTS")
        query = input("Search query: ").strip()
        tag_filter = input("Tag filter (optional): ").strip() or None
        
        results = self.orchestrator.search_documents(query, tag_filter=tag_filter)
        
        print(f"\n📌 Found {len(results)} documents:")
        for result in results[:10]:
            print(f"  - {result["name"]} (ID: {result["doc_id"]}, Score: {result["match_score"]:.2f})")
    
    def _link_documents(self):
        """Link two documents"""
        print("\n🔗 LINK DOCUMENTS")
        doc_id_1 = input("First document ID: ").strip()
        doc_id_2 = input("Second document ID: ").strip()
        relationship = input("Relationship (related/depends-on/references): ").strip() or "related"
        
        success, message = self.orchestrator.link_documents(doc_id_1, doc_id_2, relationship)
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")
    
    def _create_roadmap_item(self):
        """Create a roadmap item"""
        print("\n🗺️  CREATE ROADMAP ITEM")
        item_id = input("Item ID: ").strip()
        section = input("Section (A-Z): ").strip()
        title = input("Title: ").strip()
        description = input("Description: ").strip()
        priority = int(input("Priority (1-4, 1=low): ").strip() or "2")
        estimated_effort = float(input("Estimated hours: ").strip() or "0")
        
        success, message = self.orchestrator.create_roadmap_item(
            item_id, section, title, description, priority, estimated_effort
        )
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")
    
    def _view_roadmap_progress(self):
        """View roadmap progress"""
        print("\n📊 ROADMAP PROGRESS")
        progress = self.orchestrator.get_roadmap_progress()
        
        print(f"\n📈 Overall Progress")
        print(f"  Total Items: {progress["total_items"]}")
        print(f"  Completed: {progress["completed"]}")
        print(f"  In Progress: {progress["in_progress"]}")
        print(f"  Planned: {progress["planned"]}")
        print(f"  Completion: {progress["completion_percent"]:.1f}%")
        print(f"\n⏱️  Effort")
        print(f"  Estimated: {progress["total_estimated_hours"]:.1f} hours")
        print(f"  Actual: {progress["total_actual_hours"]:.1f} hours")
        print(f"  Efficiency: {progress["efficiency"]:.1f}%")
    
    def _link_doc_to_roadmap(self):
        """Link document to roadmap"""
        print("\n🔗 LINK DOCUMENT TO ROADMAP")
        doc_id = input("Document ID: ").strip()
        roadmap_item_id = input("Roadmap item ID: ").strip()
        
        success, message = self.orchestrator.link_document_to_roadmap(doc_id, roadmap_item_id)
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")

    def _create_todo(self):
        """Create a todo item"""
        print("\n✅ CREATE TODO")
        todo_id = input("Todo ID: ").strip()
        title = input("Title: ").strip()
        description = input("Description: ").strip()
        priority = int(input("Priority (1-4, 1=low): ").strip() or "2")
        estimated_effort = float(input("Estimated hours: ").strip() or "0")
        
        success, message = self.orchestrator.create_todo_item(
            todo_id, title, description, priority, estimated_effort
        )
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")
    
    def _update_todo(self):
        """Update a todo item"""
        print("\n🔄 UPDATE TODO")
        todo_id = input("Todo ID: ").strip()
        status = input("Status (pending/in-progress/completed/blocked): ").strip() or None
        actual_effort = float(input("Actual hours (optional): ").strip() or "0") or None
        
        success, message = self.orchestrator.update_todo_item(
            todo_id, status=status, actual_effort=actual_effort
        )
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")
    
    def _view_todo_progress(self):
        """View todo progress"""
        print("\n📊 TODO PROGRESS")
        progress = self.orchestrator.get_todo_progress()
        
        print(f"\n📈 Overall Progress")
        print(f"  Total Items: {progress["total_items"]}")
        print(f"  Completed: {progress["completed"]}")
        print(f"  In Progress: {progress["in_progress"]}")
        print(f"  Planned: {progress["planned"]}")
        print(f"  Completion: {progress["completion_percent"]:.1f}%")
        print(f"\n⏱️  Effort")
        print(f"  Estimated: {progress["total_estimated_hours"]:.1f} hours")
        print(f"  Actual: {progress["total_actual_hours"]:.1f} hours")
        print(f"  Efficiency: {progress["efficiency"]:.1f}%")
    
    def _get_todos_by_status(self):
        """Get todos by status"""
        print("\n📋 TODOS BY STATUS")
        status = input("Status (pending/in-progress/completed/blocked): ").strip() or None
        
        todos = self.orchestrator.get_todos_by_status(status)
        
        print(f"\n📌 Found {len(todos)} todos:")
        for todo in todos[:10]:
            print(f"  - {todo["title"]} (ID: {todo["todo_id"]}, Status: {todo["status"]})")

    def _validate_file(self):
        """Validate a single file"""
        print("\n🔍 VALIDATE FILE")
        file_path = input("File path: ").strip()
        
        success, message = self.orchestrator.validate_file(file_path)
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")

    def _validate_directory(self):
        """Validate a directory"""
        print("\n🔍 VALIDATE DIRECTORY")
        dir_path = input("Directory path: ").strip()
        
        success, message = self.orchestrator.validate_directory(dir_path)
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")

    def _validate_and_commit(self):
        """Validate and commit changes"""
        print("\n🔍 VALIDATE AND COMMIT")
        commit_message = input("Commit message: ").strip()
        
        success, message = self.orchestrator.validate_and_commit(commit_message)
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")

    def _view_validation_report(self):
        """View latest validation report"""
        print("\n📊 VALIDATION REPORT")
        report = self.orchestrator.get_validation_report()
        
        if report:
            print(json.dumps(report, indent=2))
        else:
            print("\n❌ No validation report found.")

    def _create_work_item(self):
        """Create a complete work item (roadmap + todo + doc)"""
        print("\n🔗 CREATE COMPLETE WORK ITEM")
        item_id = input("Work Item ID: ").strip()
        roadmap_section = input("Roadmap Section (A-Z): ").strip()
        roadmap_title = input("Roadmap Title: ").strip()
        roadmap_description = input("Roadmap Description: ").strip()
        roadmap_priority = int(input("Roadmap Priority (1-4, 1=low): ").strip() or "2")
        roadmap_estimated_effort = float(input("Roadmap Estimated hours: ").strip() or "0")
        
        todo_title = input("Todo Title: ").strip()
        todo_description = input("Todo Description: ").strip()
        todo_priority = int(input("Todo Priority (1-4, 1=low): ").strip() or "2")
        todo_estimated_effort = float(input("Todo Estimated hours: ").strip() or "0")
        
        doc_name = input("Document Name: ").strip()
        doc_path = input("Document File Path: ").strip()
        doc_type = input("Document Type (markdown/json/plaintext/code): ").strip() or "markdown"
        doc_description = input("Document Description: ").strip()
        doc_tags = input("Document Tags (comma-separated): ").strip().split(",") if input("Document Tags (comma-separated): ").strip() else []
        
        success, message = self.orchestrator.create_complete_work_item(
            item_id,
            roadmap_section, roadmap_title, roadmap_description, roadmap_priority, roadmap_estimated_effort,
            todo_title, todo_description, todo_priority, todo_estimated_effort,
            doc_name, doc_path, doc_type, doc_description, doc_tags
        )
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")

    def _complete_work_item(self):
        """Complete a work item"""
        print("\n✅ COMPLETE WORK ITEM")
        item_id = input("Work Item ID: ").strip()
        actual_effort = float(input("Actual hours: ").strip() or "0")
        
        success, message = self.orchestrator.complete_work_item(item_id, actual_effort)
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")

    def _get_work_item_status(self):
        """Get work item status"""
        print("\n📊 WORK ITEM STATUS")
        item_id = input("Work Item ID: ").strip()
        
        status = self.orchestrator.get_work_item_status(item_id)
        
        if status:
            print(json.dumps(status, indent=2))
        else:
            print("\n❌ Work item not found.")

    def _system_status(self):
        """Get overall system status"""
        print("\n📊 SYSTEM STATUS")
        status = self.orchestrator.get_system_status()
        print(json.dumps(status, indent=2))

    def _full_system_report(self):
        """Generate a full system report"""
        print("\n📊 FULL SYSTEM REPORT")
        report = self.orchestrator.generate_full_system_report()
        print(json.dumps(report, indent=2))

    def _export_report(self):
        """Export a report to markdown"""
        print("\n📄 EXPORT REPORT")
        report_type = input("Report type (system/validation/sop): ").strip()
        file_name = input("File name (e.g., report.md): ").strip()
        
        success, message = self.orchestrator.export_report(report_type, file_name)
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")

    def _health_check(self):
        """Perform a system health check"""
        print("\n🏥 HEALTH CHECK")
        success, message = self.orchestrator.perform_health_check()
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")

    def _list_sops(self):
        """List all available SOPs"""
        print("\n📋 LIST SOPS")
        sops = self.sop_agent.list_sops()
        if sops:
            for sop in sops:
                print(f"  - {sop}")
        else:
            print("\n❌ No SOPs found.")

    def _execute_sop(self):
        """Execute a specific SOP"""
        print("\n▶️ EXECUTE SOP")
        sop_name = input("SOP Name: ").strip()
        params_json = input("Parameters (JSON string, optional): ").strip()
        params = json.loads(params_json) if params_json else {}
        
        success, message = self.sop_agent.execute_sop(sop_name, params)
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")

    def _create_sop_from_operations(self):
        """Create an SOP from a sequence of operations"""
        print("\n✨ CREATE SOP FROM OPERATIONS")
        sop_name = input("New SOP Name: ").strip()
        operations_json = input("Operations (JSON string of list of dicts): ").strip()
        operations = json.loads(operations_json)
        
        success, message = self.sop_agent.create_sop_from_operations(sop_name, operations)
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")

    def _validate_sop(self):
        """Validate an SOP"""
        print("\n✅ VALIDATE SOP")
        sop_name = input("SOP Name: ").strip()
        
        success, message = self.sop_validator.validate_sop(sop_name)
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")

    def _refine_sop(self):
        """Refine an SOP"""
        print("\n✨ REFINE SOP")
        sop_name = input("SOP Name: ").strip()
        
        success, message = self.sop_refiner.refine_sop(sop_name)
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")

    def _view_sop_metrics(self):
        """View SOP execution metrics"""
        print("\n📊 SOP METRICS")
        metrics = self.sop_agent.get_sop_metrics()
        print(json.dumps(metrics, indent=2))

    def _view_execution_history(self):
        """View SOP execution history"""
        print("\n📜 EXECUTION HISTORY")
        history = self.sop_agent.get_execution_history()
        if history:
            for entry in history:
                print(json.dumps(entry, indent=2))
        else:
            print("\n❌ No execution history found.")

    def _export_sop_report(self):
        """Export SOP report"""
        print("\n📄 EXPORT SOP REPORT")
        sop_name = input("SOP Name: ").strip()
        file_name = input("File name (e.g., sop_report.md): ").strip()
        
        success, message = self.sop_agent.export_sop_report(sop_name, file_name)
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")

    def _rebuild_from_sop(self):
        """Rebuild system from SOP"""
        print("\n🔄 REBUILD FROM SOP")
        sop_name = input("SOP Name: ").strip()
        
        success, message = self.sop_agent.rebuild_from_sop(sop_name)
        
        if success:
            print(f"\n✅ {message}")
        else:
            print(f"\n❌ {message}")


def main():
    parser = argparse.ArgumentParser(description="Vision Cortex CLI")
    parser.add_argument("--workspace_root", type=str, default=".",
                        help="Root directory of the workspace")
    args = parser.parse_args()
    
    cli = VisionCortexCLI(args.workspace_root)
    cli.run_interactive()


if __name__ == "__main__":
    main()
