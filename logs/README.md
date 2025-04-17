# Spin Network Application Logs

*Last Updated: April 17, 2025*

This directory contains the logs for the Spin Network Application, with separate sections for application and simulation logs.

## Directory Structure

```
/logs
├── application/                 # Application-level logs
│   ├── error/                   # Application error logs
│   ├── performance/             # Performance logs
│   └── user/                    # User activity logs
├── simulation/                  # Simulation-specific logs
│   ├── sessions/                # Simulation session logs (JSON format)
│   ├── stability/               # Numerical stability logs
│   ├── performance/             # Simulation performance logs
│   ├── exports/                 # Exported simulation data (CSV, JSON)
│   └── graphs/                  # Graph structure and metadata
├── .gitignore                   # Ignore log files but keep directory structure
└── README.md                    # This documentation file
```

## Log Types and Formats

### Application Logs

#### Error Logs (`application/error/`)
- Format: `app-error-YYYY-MM-DD.log`
- Content: JSON formatted error records, including stacktraces, timestamps, and contextual information
- Purpose: Tracking application errors for debugging and monitoring

#### Performance Logs (`application/performance/`)
- Format: `app-perf-YYYY-MM-DD.log`
- Content: Metrics for application performance, including component render times, load times, and resource usage
- Purpose: Monitoring and optimizing application performance

#### User Activity Logs (`application/user/`)
- Format: `user-activity-YYYY-MM-DD.log`
- Content: Anonymized user interactions with major application features
- Purpose: Understanding usage patterns and feature popularity

### Simulation Logs

#### Session Logs (`simulation/sessions/`)
- Format: `sim-session-[ID]-YYYY-MM-DD.json`
- Content: Complete record of simulation sessions including parameters, events, and results
- Purpose: Persistence of simulation sessions for review and reloading

#### Stability Logs (`simulation/stability/`)
- Format: `sim-stability-[ID]-YYYY-MM-DD.log`
- Content: Detailed records of numerical stability issues, normalization events, and stability metrics
- Purpose: Monitoring and debugging numerical stability in simulations

#### Performance Logs (`simulation/performance/`)
- Format: `sim-perf-[ID]-YYYY-MM-DD.log`
- Content: Performance metrics for simulations, including step time, calculation costs, and memory usage
- Purpose: Optimizing simulation performance

#### Exported Data (`simulation/exports/`)
- Format: 
  - `sim-export-[ID]-YYYY-MM-DD.json` - Configuration and parameters
  - `sim-export-[ID]-YYYY-MM-DD.csv` - Time series results data
- Content: Exported simulation data in formats suitable for external analysis
- Purpose: Data extraction for further analysis in other tools

#### Graph Data (`simulation/graphs/`)
- Format: `graph-[ID]-YYYY-MM-DD.json`
- Content: Graph structure, metadata (type, size, parameters), and network statistics
- Purpose: Storing network structures for analysis and reuse in simulations

## Log Rotation and Management

Logs are automatically rotated based on the following policies:

1. **Size-Based Rotation:**
   - Log files larger than 10MB will be automatically rotated
   - Older log files will be compressed to save space

2. **Time-Based Rotation:**
   - Application logs are rotated daily
   - Simulation logs are kept per session

3. **Retention Policy:**
   - Application logs are retained for 30 days
   - Simulation logs are retained for 90 days
   - Session data marked as "important" by users is retained indefinitely

## Integration with Simulation Loggers

The logging system integrates with two main logger implementations:

1. **SimulationLogger (`lib/utils/simulationLogger.ts`)** - Focuses on stability monitoring and numerical precision
2. **Simulation Session Logger (`src/simulation/core/simulationLogger.ts`)** - Tracks simulation events, parameter changes, and results

These loggers will automatically write to the appropriate directories within this structure.

## Privacy & Security Notes

- User logs do not contain personally identifiable information
- All logs are stored locally on the user's machine
- Logs contained in these directories are not automatically sent to any servers
- Users can manually clear logs via the application settings at any time
