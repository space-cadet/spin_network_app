// Test Logger Module
export const testLogger = {
    session: null,
    logs: [],

    startSession() {
        this.session = {
            startTime: new Date(),
            logs: []
        };
    },

    log(message, type = 'info') {
        const logEntry = {
            timestamp: new Date(),
            type,
            message
        };
        this.logs.push(logEntry);
        this._updateDisplay(logEntry);
    },

    success(message) {
        this.log(message, 'success');
    },

    error(message) {
        this.log(message, 'error');
    },

    warning(message) {
        this.log(message, 'warning');
    },

    clearLogs() {
        this.logs = [];
        const consoleOutput = document.getElementById('console-output');
        if (consoleOutput) {
            consoleOutput.innerHTML = '';
        }
    },

    _updateDisplay(logEntry) {
        const consoleOutput = document.getElementById('console-output');
        if (consoleOutput) {
            const line = document.createElement('div');
            line.className = `log-${logEntry.type}`;
            line.textContent = `[${logEntry.timestamp.toLocaleTimeString()}] ${logEntry.message}`;
            
            // Add color based on log type
            switch (logEntry.type) {
                case 'success':
                    line.style.color = '#4caf50';
                    break;
                case 'error':
                    line.style.color = '#f44336';
                    break;
                case 'warning':
                    line.style.color = '#ff9800';
                    break;
                default:
                    line.style.color = '#fff';
            }
            
            consoleOutput.appendChild(line);
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
        }
    }
};