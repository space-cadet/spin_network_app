// UI Elements Module for Test Infrastructure
export const uiElements = {
    applyDefaultStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .test-button {
                margin: 5px;
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                background: #4a90e2;
                color: white;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.2s;
            }
            .test-button:hover {
                background: #357abd;
            }
            .test-panel {
                margin: 10px 0;
                padding: 15px;
                border: 1px solid #dee2e6;
                border-radius: 4px;
            }
            .console-output {
                margin: 10px 0;
                padding: 15px;
                background: #1e1e1e;
                color: #fff;
                font-family: monospace;
                border-radius: 4px;
                min-height: 100px;
                max-height: 300px;
                overflow-y: auto;
            }
            .tensor-visualization {
                margin: 15px 0;
                border-collapse: collapse;
                background: white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .tensor-visualization td {
                padding: 8px;
                border: 1px solid #dee2e6;
                text-align: right;
                font-family: monospace;
                min-width: 60px;
            }
            
            .tensor-visualization tr:nth-child(even) {
                background: #f8f9fa;
            }
            
            .tensor-visualization div {
                padding: 10px;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                font-family: monospace;
            }
        `;
        document.head.appendChild(style);
    },

    createButton(label, onClick) {
        const button = document.createElement('button');
        button.textContent = label;
        button.className = 'test-button';
        button.addEventListener('click', onClick);
        return button;
    },

    createControlPanel(id) {
        const panel = document.createElement('div');
        panel.id = id;
        panel.className = 'test-panel';
        return panel;
    },

    createResultsPanel(id, title) {
        const panel = document.createElement('div');
        panel.id = id;
        panel.className = 'test-panel';
        if (title) {
            const heading = document.createElement('h2');
            heading.textContent = title;
            panel.appendChild(heading);
        }
        return panel;
    },

    createConsoleOutput(id) {
        const console = document.createElement('div');
        console.id = id;
        console.className = 'console-output';
        return console;
    },

    clearConsole(id) {
        const console = document.getElementById(id);
        if (console) {
            console.innerHTML = '';
        }
    },

    appendToConsole(id, message, type = 'log') {
        const console = document.getElementById(id);
        if (console) {
            const line = document.createElement('div');
            line.className = `console-${type}`;
            line.textContent = message;
            console.appendChild(line);
            console.scrollTop = console.scrollHeight;
        }
    }
};