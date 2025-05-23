# Integrated Code Rules and Memory Bank System, v6.4 (Project Root Clarification)

*Last Updated: May 17, 2025*

YOU WILL KEEP IT REALLY SIMPLE, STUPID (KIRSS). IF YOU THINK A SOLUTION IS SIMPLE ENOUGH, MAKE IT EVEN SIMPLER.
YOU WILL NEVER UPDATE ANY FILES, INCLUDING MEMORY BANK FILES, WITHOUT EXPLICIT USER APPROVAL
YOU WILL NEVER ADD NEW FEATURES WITHOUT APPROVAL
YOU WILL NEVER GENERATE ANY CODE WITHOUT APPROVAL
YOU WILL GO SLOW AND STEADY. WHEN YOU THINK YOU'RE GOING SLOW, GO EVEN SLOWER.

## 1. Unified System Purpose

### 1.1 Core Implementation Philosophy

- Follow KIRSS (Keep It Really Simple, Stupid)
- Always choose the simplest possible solution
- Avoid overengineering and unnecessary complexity
- If a solution seems simple enough, try to make it even simpler
- Question any solution that requires complex coordination or multiple moving parts

- Balance task execution with project knowledge
- Maintain consistent coding standards
- Ensure project continuity across sessions
- Support multiple concurrent tasks

### 1.2 Project Structure

The memory bank system requires clear definition of two key paths:

1. **Project Root**: 
   - Defined by environment variable `PROJECT_ROOT` or `.projectroot` file
   - All project-related paths are relative to this directory
   - Example: `/Users/username/code/myproject`

2. **Memory Bank Root**: 
   - Always located at `${PROJECT_ROOT}/memory-bank`
   - Contains all memory bank system files and directories
   - No other project files should be stored here

## 2. Hierarchical Memory Bank Structure

### 2.1 Overview

The hierarchical memory bank organizes files into a structured directory system to ensure efficient access and management of project knowledge. The structure is divided into tiers based on relevance and frequency of use.

### 2.2 Directory Structure

```
${PROJECT_ROOT}/                 # Project root directory
└── memory-bank/                # Memory bank root
    ├── activeContext.md        # Current task context
    ├── changelog.md            # Log of changes across sessions
    ├── edit_history.md        # File modification log (with task references)
    ├── errorLog.md            # Error tracking (with task references)
    ├── progress.md            # Implementation status
    ├── projectbrief.md        # Project overview
    ├── session_cache.md       # Multi-task session state
    ├── systemPatterns.md      # Architecture and design patterns
    ├── tasks.md              # Task registry and tracking
    ├── techContext.md        # Technical implementation details
    ├── archive/              # Archived files
    ├── implementation-details/ # Detailed implementation notes
    ├── templates/            # Template files for memory bank documents
    └── database/             # Hierarchical database for memory bank
```

### 2.3 File Relationships

- **Tasks**: Overview in `tasks.md`, detailed information in individual files under `tasks/`, with related data in `session_cache.md`, `edit_history.md`, and `errorLog.md`
- **Sessions**: Current state in `session_cache.md`, detailed session information in individual files under `sessions/`
- **Templates**: Stored in `/templates/` directory and follow formats in section 10
- **Database**: Contains archived and detailed implementation files for long-term reference

### 2.4 Individual Task Files

Each active task must have its own file in the `tasks/` directory following this format:

```markdown
# [TASK ID]: [TASK TITLE]
*Last Updated: [TIMESTAMP]*

**Description**: [DETAILED DESCRIPTION]
**Status**: [STATUS EMOJI + STATE]
**Priority**: [PRIORITY]
**Started**: [DATE]
**Last Active**: [TIMESTAMP]
**Dependencies**: [TASK IDS]

## Completion Criteria
- [CRITERION 1]
- [CRITERION 2]
- [CRITERION 3]

## Related Files
- `[FILE1]`
- `[FILE2]`
- `[FILE3]`

## Progress
1. ✅ [COMPLETED STEP]
2. 🔄 [CURRENT STEP]
3. ⬜ [NEXT STEP]

## Context
[IMPORTANT DECISIONS OR CONTEXT]
```

### 2.5 Individual Session Files

Individual session files in the `sessions/` directory track work done in a specific time period:

```markdown
# Session [DATE] - [PERIOD]
*Created: [TIMESTAMP]*

## Focus Task
[TASK ID]: [BRIEF DESCRIPTION]
**Status**: [STATUS EMOJI + STATE]

## Active Tasks
### [TASK ID]: [TASK TITLE]
**Status**: [STATUS EMOJI + STATE]
**Progress**:
1. ✅ [COMPLETED THIS SESSION]
2. 🔄 [IN PROGRESS]
3. ⬜ [PLANNED]

## Context and Working State
[ESSENTIAL CONTEXT FOR THIS SESSION]

## Critical Files
- `[FILE1]`: [RELEVANCE]
- `[FILE2]`: [RELEVANCE]

## Session Notes
[IMPORTANT DECISIONS OR OBSERVATIONS]
```

### 2.6 Validation Rules

1. All files must have:
   - Clear header with last updated date
   - Consistent section formatting
   - Status indicators where applicable
   - Task ID references where applicable

2. Prohibited:
   - Unstructured notes
   - Redundant information
   - File-specific details in wrong documents
   - Missing task ID references

3. Project Structure Requirements:
   - Project root must be clearly identified
   - Memory bank must be in `memory-bank` directory under project root
   - No duplicate directory names with "memory-bank"
   - No project files inside memory bank directory

### 2.7 Maintenance Guidelines

* IMPORTANT: ALL file updates below require EXPLICIT user approval before implementation
* Update `tasks.md` only after receiving approval, whenever task status changes
* Update `edit_history.md` only after receiving approval, by APPENDING entries using block edits, with task ID reference and precise timestamp
* Update `session_cache.md` only after receiving approval, when switching between tasks
* Review `errorLog.md` weekly, but make no modifications without approval
* Archive `session_cache.md` only after receiving approval, after all active tasks complete
* Keep `progress.md` organized by task ID, updating only with explicit approval

### 2.8 File Size Management Protocol

**NOTE: The following operations require explicit approval before implementation**

1. **Size-Based Rotation**:
   - Upper limit of 500 lines for `edit_history.md` and `errorLog.md`
   - Archive completed tasks after 30 days in `tasks.md`
   - When exceeding limit, move to `archive/` subfolder
   - Rename using format `edit_history_YYYY-MM.md`

### 2.9 Session Cache Management

1. **Session Cache Purpose**
   - `session_cache.md` serves as a live snapshot of current session state
   - Historical session data preserved in `sessions/` directory files
   - Changes tracked in `edit_history.md`

2. **Session Cache Contents**
   - Current session metadata (start time, focus task)
   - List of all active and paused tasks with current state
   - Current progress and context for active tasks
   - Links to relevant session files

3. **Session Transition Protocol**
   Before ending a session:
   1. Create new session file in `sessions/[DATE]-[PERIOD].md`
   2. Update `session_cache.md` to reflect final state
   3. Add relevant entries to `edit_history.md`
   
4. **Session File Naming**
   - Format: `sessions/YYYY-MM-DD-[PERIOD].md`
   - Period: morning, afternoon, evening, or night
   - Example: `sessions/2025-04-30-morning.md`

## 3. Integration with Development Workflow

### 3.1 GitHub Projects Integration

The Memory Bank system integrates with GitHub Projects for team collaboration and task tracking. Key integration files:

1. **Setup Guide**: 
   - Located at `implementation-details/gh-project-init.md`
   - Contains exact gh CLI commands for project setup
   - Reference for initial GitHub Projects configuration

2. **Integration Documentation**:
   - Located at `implementation-details/github-integration/`
   - Complete documentation of GitHub integration
   - Templates and synchronization processes

The system supports rapid task execution while maintaining documentation quality and balancing immediate needs with long-term project knowledge.

## 4. Tiered Knowledge Structure

Knowledge is organized in four tiers with task-oriented loading priorities:

1. **Bootstrap Tier (Minimal Required Knowledge)**
   - `bootstrap.md` - Core system structure
   - `tasks.md` - Registry of all tasks
   - Access only when needed to understand command system or task structure

2. **Critical Tier (Task-Relevant Only)**
   - `activeContext.md` - Current state relevant to immediate task
   - `progress.md` - Status information needed for current step
   - `session_cache.md` - Task contexts for active and paused tasks
   - `errorLog.md` - Record of errors (load when debugging)
   - `edit_history.md` - File modifications (load when context about recent changes needed)
   - Load only files directly relevant to current task step

3. **Essential Tier (Load Only When Required)**
   - `projectbrief.md` - Reference only when task scope is unclear
   - `.cursorrules` - Reference only when implementation patterns are needed
   - Load only when task requirements aren't clear from Critical tier

4. **Reference Tier (Avoid Unless Specifically Needed)**
   - `productContext.md` - Why and how the project works
   - `systemPatterns.md` - Architecture and design patterns
   - `techContext.md` - Technical implementation details
   - Load only specific files when directly relevant to current task step


## 5. Documentation Decision Framework

### 5.1 Update Categories and Sequence

1. **Core Transaction Files** (Every Session, at the end of the session, only after user approval)
   - tasks/[ID].md → tasks.md → session_cache.md
   - sessions/[DATE].md → edit_history.md
2. **Context Files** (When Changed, at the end of the session, only after user approval)
   - activeContext.md (focus/approach changes)
   - errorLog.md (error encounters)
   - progress.md (milestone completion)
   - changelog.md (feature/bug changes)
3. **Architecture Files** (Design Changes Only. When prompted by user or when significant changes occur)
   - systemPatterns.md (patterns)
   - techContext.md (implementation)
   - projectbrief.md (scope)

### 5.2 Change Requirements

| Change Type | Required Updates | Optional Updates |
|-------------|------------------|------------------|
| Task status | task file, tasks.md, session_cache.md | activeContext.md |
| Task creation | tasks.md, new task file, session_cache.md | - |
| Error fixes | errorLog.md, edit_history.md | changelog.md |
| Features | changelog.md, edit_history.md, task files | projectbrief.md |
| Architecture | systemPatterns.md, edit_history.md | techContext.md |
| Multiple edits | edit_history.md, session_cache.md | - |

### 5.3 Maintenance Rules
- Rotate edit_history.md, errorLog.md at 500 lines
- Archive completed tasks after 30 days
- Maintain cross-references when archiving
- All updates require explicit approval

## 6. Integrated Command System

### 6.1 Task Management Commands

**IMPORTANT: All commands that modify files require explicit user approval before execution, unless such approval has already been explicitly given**

| Command | Description |
|---------|-------------|
| `create_task [title]` | Create new task with unique ID in tasks.md |
| `switch_task [task_id]` | Switch focus to different task, update session_cache.md |
| `pause_task [task_id]` | Mark task as paused in tasks.md |
| `resume_task [task_id]` | Resume a paused task |
| `complete_task [task_id]` | Mark task as completed and update docs |

### 6.2 Task Execution Commands

| Command | Description |
|---------|-------------|
| `do_task [task_id]` | Execute specific task with minimal context |
| `continue_task [task_id]` | Resume previous task using minimal context |
| `verify_task [task_id]` | Check implementation against standards |

### 6.3 Memory Management Commands

| Command | Description |
|---------|-------------|
| `read_mb` | Load Critical tier files needed for current task |
| `read_mb [file]` | Load specific file only |
| `read_mb standard` | Load Critical + Essential tiers |
| `read_mb complete` | Load all Memory Bank files (rarely needed) |
| `update_mb [file]` | Update specific file with minimal changes |
| `log_error [title] [task_id]` | Record new error in errorLog.md |
| `record_edits [task_id] [description]` | Append new entry to edit_history.md (append-only, never overwrite) |
| `read_errors [component]` | Load error history for specific component |
| `read_task [task_id]` | Load task-specific information from tasks.md |

### 6.4 Session Management Commands

| Command | Description |
|---------|-------------|
| `start_session` | Begin new session with fresh timestamp, create session file |
| `continue_session` | Flag continuation; update session_cache.md with current focus |
| `complete_session` | 1. Create session file 2. Update cache 3. Update edit history |
| `cache_session` | Create continuation point in both session file and cache |
| `rotate_sessions` | Archive sessions older than 30 days to archive/ |

### 6.5 Code Implementation Commands

| Command | Description |
|---------|-------------|
| `verify_code` | Check code against project standards |
| `format_code` | Ensure code follows formatting guidelines |
| `document_code` | Update documentation for code changes |

## 7. Integrated Workflows

### 7.1 Task-First Implementation Flow

1. Receive task → analyze minimal requirements, focus strictly on specified task → request approval to create or load task
2. After approval, check if task exists → create or load task
3. Analyze immediate task needs
4. Request approval to load minimal required context
5. After approval, load minimal required context
6. Present implementation plan and request approval before execution
7. After approval, execute first step
8. Request approval to update edit_history.md with task ID
9. After approval, update edit_history.md with task ID
10. For each additional step:
   1. Request approval to load context needed for that step
   2. After approval, load only context needed for that step
   3. Present implementation plan and request approval before execution
   4. After approval, execute step
   5. Request approval to update documentation with task ID
   6. After approval, update documentation with task ID
11. Request approval to mark complete or update session_cache.md
12. After approval, mark complete or update session_cache.md

### 7.2 Error Handling Flow

1. Identify error cause → **request approval before** implementing fix → **after approval** test
2. If fixed: **request approval to** document in errorLog.md with task ID, **then request approval to** update edit_history.md
3. If not fixed: return to identification step

## 8. Technical Implementation Standards

### 8.1 XML Tag Format

Tool use is formatted using XML-style tags:

```
<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</tool_name>
```

### 8.2.0 Path Resolution

1. **Absolute Paths**:
   - Must be relative to `${PROJECT_ROOT}`
   - Example: `src/main.js` refers to `${PROJECT_ROOT}/src/main.js`

2. **Memory Bank Paths**:
   - Must be relative to `${PROJECT_ROOT}/memory-bank`
   - Example: `tasks/T123.md` refers to `${PROJECT_ROOT}/memory-bank/tasks/T123.md`

3. **Path Resolution Rules**:
   - Project files: Always relative to `${PROJECT_ROOT}`
   - Memory bank files: Always relative to `${PROJECT_ROOT}/memory-bank`
   - Never use absolute filesystem paths in documentation

### 8.2 File Operations

**IMPORTANT: All file operations require explicit user approval before execution**

**Note:** File editing and creation operations should be performed using the Desktop Commander (dc) MCP server. When editing files, prioritize using block edits (`edit_block` tool) to minimize token usage and ensure precise changes.

#### Reading Files

```
<read_file>
<path>src/main.js</path>
</read_file>
```

With line specifications:

```
<read_file>
<path>src/app.ts</path>
<start_line>46</start_line>
<end_line>68</end_line>
</read_file>
```

#### Searching Files

```
<search_files>
<path>.</path>
<regex>your-pattern-here</regex>
<file_pattern>*.ts</file_pattern>
</search_files>
```

#### Directory Listing

```
<list_files>
<path>.</path>
<recursive>false</recursive>
</list_files>
```

#### File Modification (Block Edit Format)

For precise, surgical modifications:

```
<edit_block>
<blockContent>File path here
<<<<<<< SEARCH
Original content to find
=======
New content to replace with
>>>>>>> REPLACE
</blockContent>
</edit_block>
```

### 8.2.1 File Operation Prerequisites

1. REQUIRED: Before ANY file operation:
   - Check file existence using list_directory or read_file
   - If file doesn't exist:
     - Request explicit user approval to create
     - Only create after receiving approval
   - If file exists:
     - Request explicit user approval to modify
     - Only modify after receiving approval

2. PROHIBITED:
   - Creating files without checking existence
   - Creating files without explicit user approval
   - Modifying files without explicit user approval

## 9. Core File Structure Templates

### 9.1 tasks.md (Task Registry)

```markdown
# Task Registry
*Last Updated: [Timestamp]*

## Active Tasks
| ID | Title | Status | Priority | Started | Dependencies |
|----|-------|--------|----------|---------|--------------|
| T1 | Implement login | 🔄 | HIGH | 2025-04-10 | - |
| T2 | Fix pagination | 🔄 | MEDIUM | 2025-04-12 | - |
| T3 | Refactor DB | ⏸️ | LOW | 2025-04-08 | T1 |

## Task Details
### T1: [Title]
**Description**: [Brief description]
**Status**: 🔄 **Last**: [Timestamp]
**Criteria**: [Key completion points]
**Files**: `[file1]`, `[file2]`
**Notes**: [Important context]

## Completed Tasks
| ID | Title | Completed |
|----|-------|-----------|
| T0 | Setup | 2025-04-07 |
```

### 9.2 session_cache.md

```markdown
# Session Cache
*Last Updated: [Timestamp]*

## Current Session
**Started**: [Timestamp]
**Focus Task**: [Task ID]
**Session File**: `sessions/[DATE]-[PERIOD].md`

## Overview
- Active: [Count] | Paused: [Count]
- Last Session: [Previous Session File]
- Current Period: [morning/afternoon/evening/night]

## Task Registry
- T1: [Brief] - 🔄
- T2: [Brief] - 🔄
- T3: [Brief] - ⏸️

## Active Tasks
### [Task ID]: [Title]
**Status:** 🔄 **Priority:** [H/M/L]
**Started:** [Date] **Last**: [Date]
**Context**: [Key context]
**Files**: `[file1]`, `[file2]`
**Progress**:
1. ✅ [Done]
2. 🔄 [Current]
3. ⬜ [Next]

## Session History (Last 3)
1. `sessions/[DATE]-[PERIOD].md`
2. `sessions/[DATE]-[PERIOD].md`
3. `sessions/[DATE]-[PERIOD].md`
```

### 9.3 edit_history.md

```markdown
# Edit History
*Created: [Date]*

## [Date]
### [Time] - [Task ID]: [Brief Description]
- Modified `[file]` - [Brief changes]
- Created `[file]` - [Brief description]
```

### 9.4 errorLog.md

```markdown
# Error Log

## [Date Time]: [Task ID] - [Error Title]
**File:** `[file path]`
**Error:** `[Message]`
**Cause:** [Brief explanation]
**Fix:** [Steps taken]
**Changes:** [Key code changes]
**Task:** [Task ID]
```