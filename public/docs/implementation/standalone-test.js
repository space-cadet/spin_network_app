// Standalone Test JS file copied to implementation directory
// This is a simplified version to help find the missing UMD file

// Handle missing UMD file gracefully
window.addEventListener('DOMContentLoaded', function() {
  const consoleOutput = document.getElementById('console-output');
  
  function log(...args) {
    const line = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (error) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    if (consoleOutput) {
      consoleOutput.textContent += line + '\n';
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    } else {
      console.log(...args);
    }
  }

  // Check if the UMD library was loaded
  if (typeof SpinNetwork === 'undefined') {
    log('ERROR: The SpinNetwork UMD library could not be loaded.');
    log('Please run: pnpm run build:lib to generate the required library file.');
    log('Expected path: /dist/lib/spin-network.umd.js');
    
    // Add a message to the visualization container
    const visualizationContainer = document.querySelector('.visualization');
    if (visualizationContainer) {
      visualizationContainer.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h3 style="color: #ef4444;">Library Not Found</h3>
          <p>The SpinNetwork UMD library could not be loaded.</p>
          <p>Please run: <code>pnpm run build:lib</code> to generate the required library file.</p>
          <p>Expected path: <code>/dist/lib/spin-network.umd.js</code></p>
        </div>
      `;
    }
  } else {
    log('SpinNetwork UMD library loaded successfully!');
  }
});
