#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for widget testing
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Serve widget source
app.get('/widget.js', (req, res) => {
  const widgetPath = path.join(__dirname, '..', 'src', 'widget.js');
  if (fs.existsSync(widgetPath)) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(widgetPath);
  } else {
    res.status(404).send('Widget not found');
  }
});

// Serve minified widget (if built)
app.get('/widget.min.js', (req, res) => {
  const widgetPath = path.join(__dirname, '..', 'dist', 'widget.min.js');
  if (fs.existsSync(widgetPath)) {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(widgetPath);
  } else {
    res.status(404).send('Minified widget not found. Run "pnpm run build:cdn" first.');
  }
});

// Test page
app.get('/test', (req, res) => {
  const testHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>iHeardAI Widget Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .test-section {
            margin: 20px 0;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .test-section h3 {
            margin-top: 0;
            color: #555;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover {
            background: #0056b3;
        }
        .status {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            font-weight: bold;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .status.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 iHeardAI Widget Test Page</h1>
        
        <div class="test-section">
            <h3>Widget Status</h3>
            <div id="widget-status" class="status info">Loading widget...</div>
        </div>
        
        <div class="test-section">
            <h3>Widget Controls</h3>
            <button onclick="openWidget()">Open Widget</button>
            <button onclick="closeWidget()">Close Widget</button>
            <button onclick="sendTestMessage()">Send Test Message</button>
            <button onclick="updateConfig()">Update Config</button>
            <button onclick="destroyWidget()">Destroy Widget</button>
        </div>
        
        <div class="test-section">
            <h3>Configuration</h3>
            <button onclick="setLightTheme()">Light Theme</button>
            <button onclick="setDarkTheme()">Dark Theme</button>
            <button onclick="setBottomRight()">Bottom Right</button>
            <button onclick="setBottomLeft()">Bottom Left</button>
        </div>
        
        <div class="test-section">
            <h3>Logs</h3>
            <div id="logs" style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto;"></div>
        </div>
    </div>

    <script>
        // Load widget
        (function(w,d,s,o,f,js,fjs){
            w['iHeardAIWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
            js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
            js.id=o;js.src=f;js.async=1;
            if(fjs){fjs.parentNode.insertBefore(js,fjs);}else{d.head.appendChild(js);}
        })(window,document,'script','iHeardAI','/widget.js?debug=true');

        // Logging
        function log(message) {
            const logs = document.getElementById('logs');
            const timestamp = new Date().toLocaleTimeString();
            logs.innerHTML += \`[\${timestamp}] \${message}\\n\`;
            logs.scrollTop = logs.scrollHeight;
        }

        // Widget event listeners
        window.addEventListener('iHeardAIWidgetReady', () => {
            document.getElementById('widget-status').className = 'status success';
            document.getElementById('widget-status').textContent = 'Widget loaded successfully!';
            log('Widget ready event fired');
        });

        window.addEventListener('iHeardAIWidgetOpen', () => {
            log('Widget opened');
        });

        window.addEventListener('iHeardAIWidgetClose', () => {
            log('Widget closed');
        });

        window.addEventListener('iHeardAIWidgetMessage', (event) => {
            log(\`Message sent: \${event.detail}\`);
        });

        // Widget control functions
        function openWidget() {
            if (window.iHeardAIWidget) {
                window.iHeardAIWidget.open();
                log('Opening widget...');
            } else {
                log('ERROR: Widget not loaded');
            }
        }

        function closeWidget() {
            if (window.iHeardAIWidget) {
                window.iHeardAIWidget.close();
                log('Closing widget...');
            } else {
                log('ERROR: Widget not loaded');
            }
        }

        function sendTestMessage() {
            if (window.iHeardAIWidget) {
                window.iHeardAIWidget.sendMessage('Hello! This is a test message from the test page.');
                log('Sending test message...');
            } else {
                log('ERROR: Widget not loaded');
            }
        }

        function updateConfig() {
            if (window.iHeardAIWidget) {
                const newConfig = {
                    primaryColor: '#' + Math.floor(Math.random()*16777215).toString(16),
                    buttonText: 'Test Button ' + Date.now()
                };
                window.iHeardAIWidget.updateConfig(newConfig);
                log(\`Updated config: \${JSON.stringify(newConfig)}\`);
            } else {
                log('ERROR: Widget not loaded');
            }
        }

        function destroyWidget() {
            if (window.iHeardAIWidget) {
                window.iHeardAIWidget.destroy();
                document.getElementById('widget-status').className = 'status error';
                document.getElementById('widget-status').textContent = 'Widget destroyed';
                log('Widget destroyed');
            } else {
                log('ERROR: Widget not loaded');
            }
        }

        function setLightTheme() {
            if (window.iHeardAIWidget) {
                window.iHeardAIWidget.updateConfig({ theme: 'light' });
                log('Set theme to light');
            }
        }

        function setDarkTheme() {
            if (window.iHeardAIWidget) {
                window.iHeardAIWidget.updateConfig({ theme: 'dark' });
                log('Set theme to dark');
            }
        }

        function setBottomRight() {
            if (window.iHeardAIWidget) {
                window.iHeardAIWidget.updateConfig({ position: 'bottom-right' });
                log('Set position to bottom-right');
            }
        }

        function setBottomLeft() {
            if (window.iHeardAIWidget) {
                window.iHeardAIWidget.updateConfig({ position: 'bottom-left' });
                log('Set position to bottom-left');
            }
        }

        // Check widget status periodically
        setInterval(() => {
            if (window.iHeardAIWidget && window.iHeardAIWidget.isInitialized) {
                const status = document.getElementById('widget-status');
                if (status.className.includes('error')) {
                    status.className = 'status success';
                    status.textContent = 'Widget loaded successfully!';
                }
            }
        }, 2000);
    </script>
</body>
</html>`;
  
  res.send(testHtml);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    widget: {
      source: fs.existsSync(path.join(__dirname, '..', 'src', 'widget.js')),
      minified: fs.existsSync(path.join(__dirname, '..', 'dist', 'widget.min.js'))
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 iHeardAI Widget Development Server');
  console.log('====================================');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🧪 Test page: http://localhost:${PORT}/test`);
  console.log(`📦 Widget source: http://localhost:${PORT}/widget.js`);
  console.log(`📦 Widget minified: http://localhost:${PORT}/widget.min.js`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

module.exports = app; 