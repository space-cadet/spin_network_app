# Task Registry
*Last Updated: [Timestamp]*

## Active Tasks
| ID | Title | Status | Priority | Started | Dependencies | Owner |
|----|-------|--------|----------|---------|--------------|-------|
| T1 | Implement login API | 🔄 IN PROGRESS | HIGH | 2025-04-10 | - | [Name] |
| T2 | Fix pagination bug | 🔄 IN PROGRESS | MEDIUM | 2025-04-12 | - | [Name] |
| T3 | Refactor database layer | ⏸️ PAUSED | LOW | 2025-04-08 | T1 | [Name] |

## Task Details

### T1: [Task Title]
**Description**: [Detailed description of the task]
**Status**: 🔄 IN PROGRESS
**Last Active**: [Timestamp]
**Completion Criteria**:
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

**Subtasks**:
- T1.1: [Subtask Title] - 🔄 IN PROGRESS
- T1.2: [Subtask Title] - ✅ COMPLETE
- T1.3: [Subtask Title] - ⬜ NOT STARTED

**Related Files**:
- `[file1]`
- `[file2]`
- `[file3]`

**Notes**:
[Important decisions or context]

### T2: [Task Title]
[Same structure as T1]

### T3: [Task Title]
[Same structure as T1]

## Completed Tasks
| ID | Title | Completed | Related Tasks |
|----|-------|-----------|---------------|
| T0 | Project setup | 2025-04-07 | - |

## Task Relationships
```mermaid
graph TD
    T1[T1: Task Title]
    T2[T2: Task Title]
    T3[T3: Task Title]
    T0[T0: Task Title]
    
    T0 --> T1
    T0 --> T2
    T0 --> T3
    T3 -.-> T1
    
    T1 --> T1.1[T1.1: Subtask]
    T1 --> T1.2[T1.2: Subtask]
    T1 --> T1.3[T1.3: Subtask]
