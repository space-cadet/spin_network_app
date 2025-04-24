#!/usr/bin/env python3
"""
Memory Bank Restructuring Script

This script breaks down the monolithic session_cache.md and tasks.md files
into individual files following the new modular structure.

Usage:
    python memory_bank_restructure.py

Requirements:
    - Python 3.6+
    - re module (standard library)
    - os module (standard library)
    - datetime module (standard library)
"""

import os
import re
import datetime
from pathlib import Path

# Configuration
PROJECT_ROOT = Path("/Users/deepak/code/spin_network_app")
MEMORY_BANK_DIR = PROJECT_ROOT / "memory-bank"
SESSION_CACHE_PATH = MEMORY_BANK_DIR / "session_cache.md"
TASKS_PATH = MEMORY_BANK_DIR / "tasks.md"
SESSIONS_DIR = MEMORY_BANK_DIR / "sessions"
TASKS_DIR = MEMORY_BANK_DIR / "tasks"
TEMPLATE_DIR = MEMORY_BANK_DIR / "templates"

# Ensure directories exist
SESSIONS_DIR.mkdir(exist_ok=True)
TASKS_DIR.mkdir(exist_ok=True)

# Templates paths
SESSION_TEMPLATE_PATH = TEMPLATE_DIR / "session-template.md"
TASK_TEMPLATE_PATH = TEMPLATE_DIR / "task-template.md"
MASTER_SESSION_TEMPLATE_PATH = TEMPLATE_DIR / "master-session-template.md"
MASTER_TASK_TEMPLATE_PATH = TEMPLATE_DIR / "master-task-template.md"

# Current timestamp for file updates
TIMESTAMP = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def read_file(path):
    """Read file content and return as string."""
    try:
        with open(path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        print(f"Warning: File {path} not found.")
        return ""

def write_file(path, content):
    """Write content to file."""
    with open(path, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Created: {path}")

def extract_task_ids(content):
    """Extract task IDs from content using regex."""
    # Pattern matches common task ID formats like T1, T42, etc.
    pattern = r'\b(T\d+)\b'
    return set(re.findall(pattern, content))

def parse_session_cache(content):
    """Parse session_cache.md content and extract individual sessions."""
    sessions = {}
    
    # Regex to match task sections
    # This pattern looks for ### T1: Title format and captures everything until the next section
    pattern = r'### (T\d+): (.*?)(?=\n## |### |\Z)'
    matches = re.finditer(pattern, content, re.DOTALL)
    
    for match in matches:
        task_id = match.group(1)
        title = match.group(2).strip()
        section_content = match.group(0)
        
        # Extract status
        status_match = re.search(r'\*\*Status:\*\* (.*?) ', section_content)
        status = status_match.group(1) if status_match else "🔄"
        
        # Extract priority
        priority_match = re.search(r'\*\*Priority:\*\* (.*?)(\n|$)', section_content)
        priority = priority_match.group(1) if priority_match else "MEDIUM"
        
        # Extract dates
        started_match = re.search(r'\*\*Started:\*\* (.*?)(\n|$|\*\*)', section_content)
        started = started_match.group(1) if started_match else TIMESTAMP.split()[0]
        
        last_match = re.search(r'\*\*Last\*\*: (.*?)(\n|$)', section_content)
        last = last_match.group(1) if last_match else TIMESTAMP.split()[0]
        
        # Extract context
        context_match = re.search(r'\*\*Context\*\*: (.*?)(\n|$)', section_content)
        context = context_match.group(1) if context_match else ""
        
        # Extract files
        files_match = re.search(r'\*\*Files\*\*: (.*?)(\n|$)', section_content)
        files = files_match.group(1) if files_match else ""
        
        # Extract progress
        progress_pattern = r'\*\*Progress\*\*:(.*?)(?=\n\*\*|\Z)'
        progress_match = re.search(progress_pattern, section_content, re.DOTALL)
        progress = progress_match.group(1).strip() if progress_match else ""
        
        # Create session object
        sessions[task_id] = {
            'id': task_id,
            'title': title,
            'status': status,
            'priority': priority,
            'started': started,
            'last_updated': last,
            'context': context,
            'files': files,
            'progress': progress
        }
    
    return sessions

def parse_tasks(content):
    """Parse tasks.md content and extract individual tasks."""
    tasks = {}
    
    # Check if there's any content to parse
    if not content or len(content.strip()) == 0:
        print("Warning: tasks.md is empty or not found")
        return tasks
    
    # Extract active tasks table
    active_tasks_match = re.search(r'## Active Tasks\s+\|.*?\|(.*?)(?=\n\n|\n##|\Z)', content, re.DOTALL)
    active_tasks_table = active_tasks_match.group(1) if active_tasks_match else ""
    
    # Parse active tasks table
    if active_tasks_table:
        rows = active_tasks_table.strip().split('\n')
        for row in rows:
            if row.strip() and '|' in row:
                cells = [cell.strip() for cell in row.split('|')]
                if len(cells) >= 6:  # Ensure we have enough cells
                    # Skip header row or separator row
                    if all(c.startswith('-') for c in cells if c) or 'ID' in cells[1]:
                        continue
                    
                    task_id = cells[1]
                    # Validate that task_id follows the expected format (T followed by digits)
                    if not re.match(r'^T\d+$', task_id):
                        print(f"Skipping invalid task ID: {task_id}")
                        continue
                        
                    title = cells[2]
                    status = cells[3]
                    priority = cells[4]
                    started = cells[5]
                    dependencies = cells[6] if len(cells) > 6 else "-"
                    
                    tasks[task_id] = {
                        'id': task_id,
                        'title': title,
                        'status': status,
                        'priority': priority,
                        'started': started,
                        'dependencies': dependencies,
                        'completed': None,
                        'description': "",
                        'criteria': "",
                        'files': "",
                        'notes': ""
                    }
    
    # Extract completed tasks table
    completed_tasks_match = re.search(r'## Completed Tasks\s+\|.*?\|(.*?)(?=\n\n|\n##|\Z)', content, re.DOTALL)
    completed_tasks_table = completed_tasks_match.group(1) if completed_tasks_match else ""
    
    # Parse completed tasks table
    if completed_tasks_table:
        rows = completed_tasks_table.strip().split('\n')
        for row in rows:
            if row.strip() and '|' in row:
                cells = [cell.strip() for cell in row.split('|')]
                if len(cells) >= 3:  # Ensure we have enough cells
                    # Skip header row or separator row
                    if all(c.startswith('-') for c in cells if c) or 'ID' in cells[1]:
                        continue
                        
                    task_id = cells[1]
                    # Validate that task_id follows the expected format (T followed by digits)
                    if not re.match(r'^T\d+$', task_id):
                        print(f"Skipping invalid task ID: {task_id}")
                        continue
                        
                    title = cells[2]
                    completed = cells[3] if len(cells) > 3 else TIMESTAMP.split()[0]
                    
                    tasks[task_id] = {
                        'id': task_id,
                        'title': title,
                        'status': "✅",
                        'priority': "COMPLETED",
                        'started': "",
                        'dependencies': "",
                        'completed': completed,
                        'description': "",
                        'criteria': "",
                        'files': "",
                        'notes': ""
                    }
    
    # Extract task details
    details_pattern = r'### (T\d+): (.*?)(?=\n###|\Z)'
    details_matches = re.finditer(details_pattern, content, re.DOTALL)
    
    for match in details_matches:
        task_id = match.group(1)
        
        # Validate that task_id follows the expected format (T followed by digits)
        if not re.match(r'^T\d+$', task_id):
            print(f"Skipping invalid task ID in details section: {task_id}")
            continue
            
        title = match.group(2).strip()
        detail_content = match.group(0)
        
        # If task wasn't in the tables, add it now
        if task_id not in tasks:
            tasks[task_id] = {
                'id': task_id,
                'title': title,
                'status': "🔄",  # Default status
                'priority': "MEDIUM",  # Default priority
                'started': TIMESTAMP.split()[0],  # Default to current date
                'dependencies': "",
                'completed': None,
                'description': "",
                'criteria': "",
                'files': "",
                'notes': ""
            }
        else:
            # Update title if it's more detailed
            if title and len(title) > len(tasks[task_id]['title']):
                tasks[task_id]['title'] = title
        
        # Extract description
        description_match = re.search(r'\*\*Description\*\*: (.*?)(?=\n\*\*|\Z)', detail_content, re.DOTALL)
        if description_match:
            tasks[task_id]['description'] = description_match.group(1).strip()
        
        # Extract criteria
        criteria_match = re.search(r'\*\*Criteria\*\*: (.*?)(?=\n\*\*|\Z)', detail_content, re.DOTALL)
        if criteria_match:
            tasks[task_id]['criteria'] = criteria_match.group(1).strip()
        
        # Extract files
        files_match = re.search(r'\*\*Files\*\*: (.*?)(?=\n\*\*|\Z)', detail_content, re.DOTALL)
        if files_match:
            tasks[task_id]['files'] = files_match.group(1).strip()
        
        # Extract notes
        notes_match = re.search(r'\*\*Notes\*\*: (.*?)(?=\n\*\*|\Z)', detail_content, re.DOTALL)
        if notes_match:
            tasks[task_id]['notes'] = notes_match.group(1).strip()
    
    return tasks

def create_session_file(session_data):
    """Create individual session file from template and data."""
    template = read_file(SESSION_TEMPLATE_PATH)
    
    # Replace template placeholders with actual data
    content = template
    content = content.replace("[Task ID]", session_data['id'])
    content = content.replace("[Creation Date]", session_data['started'])
    content = content.replace("[Last Update Date]", session_data['last_updated'])
    content = content.replace("[Task Title]", session_data['title'])
    content = content.replace("[Status Icon: 🔄 (Active), ⏸️ (Paused), ✅ (Completed)]", session_data['status'])
    content = content.replace("[HIGH/MEDIUM/LOW]", session_data['priority'])
    content = content.replace("[Start Date]", session_data['started'])
    content = content.replace("[Brief description of current focus]", session_data['context'])
    
    # Handle progress
    if session_data['progress']:
        content = content.replace("1. ✅ [Completed Step]\n2. ✅ [Completed Step]\n3. 🔄 [Current Step]\n4. ⬜ [Planned Step]\n5. ⬜ [Planned Step]", session_data['progress'])
    
    # Handle files
    if session_data['files']:
        file_lines = []
        files = session_data['files'].replace('`', '').split(',')
        for file in files:
            file = file.strip()
            if file:
                file_lines.append(f"- `{file}`: [Related to {session_data['id']}]")
        
        content = content.replace("- `[file path]`: [Brief description of relevance]\n- `[file path]`: [Brief description of relevance]", "\n".join(file_lines))
    
    # Add a session history entry for today
    today = TIMESTAMP.split()[0]
    content = content.replace("### [Date] - [Brief description of session]", f"### {today} - Initial session file creation")
    content = content.replace("- [Work completed]\n- [Decisions made]\n- [Issues encountered]", "- Converted from monolithic session cache\n- Created modular session file")
    
    # Use last_updated date from session data, fallback to started date, then today
    session_date = (
        session_data.get('last_updated', '').split()[0] or 
        session_data.get('started', '').split()[0] or 
        today
    )
    filename = f"{session_data['id']}_{session_date.replace('-', '')}.md"
    filepath = SESSIONS_DIR / filename
    
    write_file(filepath, content)
    return filename

def create_task_file(task_data):
    """Create individual task file from template and data."""
    template = read_file(TASK_TEMPLATE_PATH)
    
    # Replace template placeholders with actual data
    content = template
    content = content.replace("[Task ID]", task_data['id'])
    content = content.replace("[Creation Date]", task_data['started'])
    content = content.replace("[Last Update Date]", TIMESTAMP)
    content = content.replace("[Task Title]", task_data['title'])
    content = content.replace("[Status Icon: 🔄 (Active), ⏸️ (Paused), ✅ (Completed)]", task_data['status'])
    content = content.replace("[HIGH/MEDIUM/LOW]", task_data['priority'])
    content = content.replace("[Start Date]", task_data['started'])
    
    # Handle completion date
    if task_data['completed']:
        content = content.replace("[Completion Date if applicable]", task_data['completed'])
    else:
        content = content.replace("[Completion Date if applicable]", "N/A")
    
    # Handle description
    if task_data['description']:
        content = content.replace("[Detailed description of the task, including purpose and goals]", task_data['description'])
    
    # Handle criteria
    if task_data['criteria']:
        criteria_lines = []
        criteria_items = task_data['criteria'].split(',')
        for item in criteria_items:
            item = item.strip()
            if item:
                criteria_lines.append(f"- [ ] {item}")
        
        if criteria_lines:
            content = content.replace("- [ ] [Criterion 1]\n- [ ] [Criterion 2]\n- [ ] [Criterion 3]", "\n".join(criteria_lines))
    
    # Handle files
    if task_data['files']:
        file_lines = []
        files = task_data['files'].replace('`', '').split(',')
        for file in files:
            file = file.strip()
            if file:
                file_lines.append(f"- `{file}`: [Related to {task_data['id']}]")
        
        content = content.replace("- `[file path]`: [Brief description of relevance]\n- `[file path]`: [Brief description of relevance]", "\n".join(file_lines))
    
    # Handle dependencies
    if task_data['dependencies'] and task_data['dependencies'] != "-":
        content = content.replace("- **Depends On:** [Task IDs this task depends on]", f"- **Depends On:** {task_data['dependencies']}")
    
    # Handle notes
    if task_data['notes']:
        note_lines = []
        notes_items = task_data['notes'].split('\n')
        for item in notes_items:
            item = item.strip()
            if item:
                note_lines.append(f"- {item}")
        
        if note_lines:
            content = content.replace("- [Important note about the task]\n- [Key insight or decision made]", "\n".join(note_lines))
    
    # Add today's date to progress tracking
    today = TIMESTAMP.split()[0]
    content = content.replace("- [Date]: [Progress update]", f"- {today}: Created individual task file")
    
    # Generate filename
    filename = f"{task_data['id']}.md"
    filepath = TASKS_DIR / filename
    
    write_file(filepath, content)
    return filename

def create_master_session_file(sessions):
    """Create master session cache file from template and data."""
    template = read_file(MASTER_SESSION_TEMPLATE_PATH)
    
    # Count sessions by status (handle both emoji and text variants)
    active_count = sum(1 for s in sessions.values() if '🔄' in s['status'] or 'IN PROGRESS' in s['status'])
    paused_count = sum(1 for s in sessions.values() if '⏸️' in s['status'] or 'PAUSED' in s['status'])
    
    # Get current focus (most recently updated active session)
    active_sessions = [s for s in sessions.values() if '🔄' in s['status'] or 'IN PROGRESS' in s['status']]
    current_focus = max(active_sessions, key=lambda s: s['last_updated'])['id'] if active_sessions else "None"
    
    # Generate session registry table
    registry_rows = []
    for task_id, session in sorted(sessions.items()):
        filename = f"{task_id}_{session['last_updated'].replace('-', '')}.md"
        
        # Clean and format title consistently
        title = session['title'].replace('\n', ' ').strip()  # Remove line breaks
        if len(title) > 40:  # Truncate long titles but maintain table alignment
            title = f"{title[:37]}…"  # Use single character ellipsis
            
        registry_rows.append(f"| {task_id} | {title} | {session['status']} | {session['priority']} | [sessions/{filename}] |")
    
    # Show all sessions
    registry_table = "\n".join(registry_rows)
    
    # Generate quick status sections - show all active sessions
    active_tasks = []
    active_sessions_list = [
        (task_id, session) for task_id, session in sessions.items() 
        if '🔄' in session['status'] or 'IN PROGRESS' in session['status']
    ]
    # Sort by last updated (most recent first)
    active_sessions_list.sort(key=lambda x: x[1].get('last_updated', '') or x[1].get('started', ''), reverse=True)
    
    for task_id, session in active_sessions_list:
        status = '🔄' if 'IN PROGRESS' in session['status'] else session['status']
        context = session.get('context', '').replace('\n', ' ').strip()
        if len(context) > 40:
            context = f"{context[:37]}…"
        last_updated = session.get('last_updated', '') or session.get('started', '')
        active_tasks.append(f"- **{task_id}:** {status} {context} - Updated {last_updated}")
    
    paused_tasks = []
    paused_sessions_list = [(task_id, session) for task_id, session in sessions.items() if session['status'] == '⏸️']
    # Sort by last updated (most recent first)
    paused_sessions_list.sort(key=lambda x: x[1]['last_updated'], reverse=True)
    
    for task_id, session in paused_sessions_list:  # Show all paused tasks
        paused_tasks.append(f"- **{task_id}:** ⏸️ Paused - {session['last_updated']}")
    
    # Replace template placeholders
    content = template
    content = content.replace("[Timestamp]", TIMESTAMP)
    content = content.replace("[Count]", str(active_count))
    content = content.replace("- **Active Sessions:** [Count]", f"- **Active Sessions:** {active_count}")
    content = content.replace("- **Paused Sessions:** [Count]", f"- **Paused Sessions:** {paused_count}")
    content = content.replace("- **Current Focus:** [Task ID]", f"- **Current Focus:** {current_focus}")
    content = content.replace("- **Last Session Update:** [Timestamp]", f"- **Last Session Update:** {TIMESTAMP}")
    content = content.replace("| T1 | [Brief Title] | 🔄 | HIGH | [sessions/T1_2025-04-21.md] |\n| T2 | [Brief Title] | 🔄 | MEDIUM | [sessions/T2_2025-04-20.md] |\n| T3 | [Brief Title] | ⏸️ | LOW | [sessions/T3_2025-04-18.md] |\n| T4 | [Brief Title] | ✅ | HIGH | [sessions/T4_2025-04-15.md] |", registry_table)
    
    # Replace active tasks section
    if active_tasks:
        content = content.replace("- **T1:** 🔄 [Current step brief] - Updated [date]\n- **T2:** 🔄 [Current step brief] - Updated [date]", "\n".join(active_tasks))
    else:
        content = content.replace("- **T1:** 🔄 [Current step brief] - Updated [date]\n- **T2:** 🔄 [Current step brief] - Updated [date]", "- No active tasks")
    
    # Replace paused tasks section
    if paused_tasks:
        content = content.replace("- **T3:** ⏸️ [Reason for pause] - Paused [date]", "\n".join(paused_tasks))
    else:
        content = content.replace("- **T3:** ⏸️ [Reason for pause] - Paused [date]", "- No paused tasks")
    
    # Add session notes
    content = content.replace("- Last session focused on [Task ID]", f"- Last session focused on {current_focus}")
    content = content.replace("- Next planned focus: [Task ID]", f"- Next planned focus: {current_focus}")
    content = content.replace("- Critical blockers: [Brief description if any]", "- No critical blockers identified")
    
    # Add command history
    content = content.replace("[Recent command]\n[Recent command]", "memory_bank_restructure.py  # Restructured memory bank")
    
    # Just remove the template text for links between tasks
    content = content.replace("## Links Between Tasks\n- T1 → T3: [Brief description of relationship]\n- T2 → T4: [Brief description of relationship]",
                            "## Links Between Tasks\n- See tasks.md for task dependencies")

    # Create new master session cache file
    master_path = MEMORY_BANK_DIR / "session_cache_new.md"
    write_file(master_path, content)
    return master_path

def create_master_task_file(tasks):
    """Create master tasks file from template and data."""
    template = read_file(MASTER_TASK_TEMPLATE_PATH)
    
    # Count tasks by status (handle both emoji and text variants)
    active_count = sum(1 for t in tasks.values() if '🔄' in t['status'] or 'IN PROGRESS' in t['status'])
    paused_count = sum(1 for t in tasks.values() if '⏸️' in t['status'] or 'PAUSED' in t['status'])
    completed_count = sum(1 for t in tasks.values() if '✅' in t['status'] or 'COMPLETE' in t['status'])
    
    # Find latest task ID - only consider valid task IDs (T followed by a number)
    valid_task_ids = [tid for tid in tasks.keys() if re.match(r'^T\d+$', tid)]
    if valid_task_ids:
        # Extract numbers from task IDs and find the maximum
        task_numbers = [int(tid[1:]) for tid in valid_task_ids]
        latest_task_number = max(task_numbers)
        latest_task_id = f"T{latest_task_number}"
    else:
        latest_task_id = "T0"
    
    # Generate active tasks table - only include minimal info in the master file
    active_rows = []
    for task_id, task in sorted(tasks.items()):
        if task['status'] != '✅':
            # Just include task ID, a brief title (truncated if needed), status, and link
            title = task['title'].replace('\n', ' ').strip()  # Remove line breaks
            if len(title) > 40:  # Truncate long titles but maintain table alignment
                title = f"{title[:37]}…"  # Use single character ellipsis
            # Normalize status to just show emoji
            status = task['status']
            if 'IN PROGRESS' in status:
                status = '🔄'
            elif 'COMPLETE' in status:
                status = '✅'
            elif 'PAUSED' in status:
                status = '⏸️'
                
            active_rows.append(f"| {task_id} | {title} | {status} | {task['priority']} | {task['started']} | [tasks/{task_id}.md] |")
    
    # Show all active tasks
    active_table = "\n".join(active_rows) if active_rows else "| - | No active tasks | - | - | - |"
    
    # Generate completed tasks table - only include minimal info and limit to recent completions
    completed_rows = []
    completed_tasks = [(task_id, task) for task_id, task in tasks.items() if task['status'] == '✅']
    # Sort by completion date (most recent first)
    completed_tasks.sort(key=lambda x: x[1]['completed'] if x[1]['completed'] else "", reverse=True)
    
    # Show all completed tasks
    for task_id, task in completed_tasks:
        title = task['title'].replace('\n', ' ').strip()  # Remove line breaks
        if len(title) > 40:  # Truncate long titles but maintain table alignment
            title = f"{title[:37]}…"  # Use single character ellipsis
        completed_rows.append(f"| {task_id} | {title} | {task['completed']} | [tasks/{task_id}.md] |")
    
    completed_table = "\n".join(completed_rows) if completed_rows else "| - | No completed tasks | - | - |"
    
    # Generate dependencies section - keep it brief
    dependencies = []
    # Only include active task dependencies
    active_task_ids = [task_id for task_id, task in tasks.items() if task['status'] != '✅']
    for task_id in active_task_ids:
        task = tasks[task_id]
        if task['dependencies'] and task['dependencies'] != "-":
            dependencies.append(f"- **{task_id}** → Depends on → **{task['dependencies']}**")
    
    # Show all dependencies
    dependencies_section = "\n".join(dependencies) if dependencies else "- No dependencies recorded"
    
    # Generate priority queue - top 5 only
    priority_queue = []
    priority_tasks = [t for t in tasks.values() if t['status'] == '🔄']
    priority_tasks.sort(key=lambda x: {"HIGH": 0, "MEDIUM": 1, "LOW": 2}.get(x['priority'], 3))
    
    for i, task in enumerate(priority_tasks[:5], 1):
        title = task['title']
        if len(title) > 30:  # Truncate long titles
            title = title[:27] + "..."
        priority_queue.append(f"{i}. **{task['id']}**: {title}")
    
    priority_section = "\n".join(priority_queue) if priority_queue else "No active tasks in queue"
    
    # Generate recent updates - keep it to just a few
    today = TIMESTAMP.split()[0]
    updates = [f"- {today}: Restructured tasks into individual files"]
    
    # Replace template placeholders
    content = template
    content = content.replace("[Timestamp]", TIMESTAMP)
    content = content.replace("- **Active Tasks:** [Count]", f"- **Active Tasks:** {active_count}")
    content = content.replace("- **Paused Tasks:** [Count]", f"- **Paused Tasks:** {paused_count}")
    content = content.replace("- **Completed Tasks:** [Count]", f"- **Completed Tasks:** {completed_count}")
    content = content.replace("- **Latest Task ID:** [Task ID]", f"- **Latest Task ID:** {latest_task_id}")
    
    # First replace the table header
    content = content.replace("### Active Tasks\n| ID | Title | Status | Priority | Created | Task File |",
                            "### Active Tasks\n| ID | Title | Status | Priority | Started | Task File |")
    
    # Then replace the example rows with our data
    content = content.replace("| T1 | [Brief Title] | 🔄 | HIGH | [Date] | [tasks/T1.md] |\n| T2 | [Brief Title] | 🔄 | MEDIUM | [Date] | [tasks/T2.md] |\n| T3 | [Brief Title] | ⏸️ | LOW | [Date] | [tasks/T3.md] |", 
                            active_table)
    content = content.replace("| T0 | [Brief Title] | [Date] | [tasks/T0.md] |", completed_table)
    
    # Replace dependencies section
    content = content.replace("- **T1** → Blocks → **T3**\n- **T2** → Depends on → **T0**", dependencies_section)
    
    # Replace priority queue
    content = content.replace("1. **T1**: [Brief reason for priority]\n2. **T2**: [Brief reason for priority]\n3. **T3**: [Brief reason for priority]", priority_section)
    
    # Replace updates section
    content = content.replace("- [Date]: Created task **T3** - [Brief description]\n- [Date]: Completed task **T0** - [Brief description]\n- [Date]: Updated priority for task **T1** - [Brief reason]", "\n".join(updates))
    
    # Create new master task file
    master_path = MEMORY_BANK_DIR / "tasks_new.md"
    write_file(master_path, content)
    return master_path

def main():
    """Main function to orchestrate the restructuring process."""
    print("Memory Bank Restructuring Script")
    print("--------------------------------")
    print(f"Timestamp: {TIMESTAMP}")
    print(f"Project Root: {PROJECT_ROOT}")
    print()
    
    # Read existing files
    print("Reading existing files...")
    session_cache_content = read_file(SESSION_CACHE_PATH)
    tasks_content = read_file(TASKS_PATH)
    
    # Parse content
    print("Parsing session cache...")
    sessions = parse_session_cache(session_cache_content)
    print(f"Found {len(sessions)} sessions")
    
    print("Parsing tasks...")
    tasks = parse_tasks(tasks_content)
    print(f"Found {len(tasks)} tasks")
    
    # Create individual session files
    print("\nCreating individual session files...")
    session_files = {}
    for task_id, session in sessions.items():
        filename = create_session_file(session)
        session_files[task_id] = filename
    
    # Create individual task files
    print("\nCreating individual task files...")
    task_files = {}
    for task_id, task in tasks.items():
        filename = create_task_file(task)
        task_files[task_id] = filename
    
    # Create master files
    print("\nCreating master session cache file...")
    master_session = create_master_session_file(sessions)
    
    print("Creating master tasks file...")
    master_tasks = create_master_task_file(tasks)
    
    print("\nRestructuring complete!")
    print(f"- New master session cache: {master_session}")
    print(f"- New master tasks file: {master_tasks}")
    print("\nTo complete the migration:")
    print("1. Review the new files")
    print("2. Rename the new master files:")
    print(f"   mv {master_session} {SESSION_CACHE_PATH}")
    print(f"   mv {master_tasks} {TASKS_PATH}")
    print("3. Update any references to these files in your workflow")
    
if __name__ == "__main__":
    main()