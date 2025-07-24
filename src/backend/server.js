const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const PuppeteerService = require('./services/puppeteerService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const puppeteerService = new PuppeteerService();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Store logs in memory for new connections
let logs = [];
const MAX_LOGS = 1000;

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current status and logs to new client
  socket.emit('status', puppeteerService.getStatus());
  socket.emit('config', puppeteerService.getConfig());
  socket.emit('logs', logs);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Set up puppeteer service event listeners
puppeteerService.on('started', (status) => {
  io.emit('status', status);
});

puppeteerService.on('visitStarted', (data) => {
  io.emit('visitStarted', data);
  io.emit('status', data.status);
});

puppeteerService.on('visitCompleted', (data) => {
  io.emit('visitCompleted', data);
  io.emit('status', data.status);
});

puppeteerService.on('paused', (status) => {
  io.emit('status', status);
});

puppeteerService.on('resumed', (status) => {
  io.emit('status', status);
});

puppeteerService.on('stopped', (status) => {
  io.emit('status', status);
});

puppeteerService.on('completed', (status) => {
  io.emit('status', status);
});

puppeteerService.on('reset', (status) => {
  io.emit('status', status);
});

puppeteerService.on('configUpdated', (config) => {
  io.emit('config', config);
});

puppeteerService.on('log', (logEntry) => {
  logs.push(logEntry);
  if (logs.length > MAX_LOGS) {
    logs.shift(); // Remove oldest log
  }
  io.emit('log', logEntry);
});

puppeteerService.on('error', (error) => {
  io.emit('error', { message: error.message, timestamp: new Date() });
});

// REST API Routes

// Get current status
app.get('/api/status', (req, res) => {
  res.json(puppeteerService.getStatus());
});

// Get current configuration
app.get('/api/config', (req, res) => {
  res.json(puppeteerService.getConfig());
});

// Update configuration
app.post('/api/config', (req, res) => {
  try {
    const config = req.body;
    
    // Validate required fields
    if (config.url && !isValidUrl(config.url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    if (config.visits && (config.visits < 1 || config.visits > 100)) {
      return res.status(400).json({ error: 'Visits must be between 1 and 100' });
    }
    
    puppeteerService.updateConfig(config);
    res.json({ success: true, config: puppeteerService.getConfig() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start automation
app.post('/api/start', async (req, res) => {
  try {
    if (puppeteerService.isRunning) {
      return res.status(400).json({ error: 'Service is already running' });
    }
    
    // Start in background
    puppeteerService.start().catch(error => {
      console.error('Puppeteer service error:', error);
    });
    
    res.json({ success: true, message: 'Automation started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pause automation
app.post('/api/pause', (req, res) => {
  try {
    puppeteerService.pause();
    res.json({ success: true, message: 'Automation paused' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Resume automation
app.post('/api/resume', (req, res) => {
  try {
    puppeteerService.resume();
    res.json({ success: true, message: 'Automation resumed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Stop automation
app.post('/api/stop', (req, res) => {
  try {
    puppeteerService.stop();
    res.json({ success: true, message: 'Automation stopped' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reset service
app.post('/api/reset', (req, res) => {
  try {
    puppeteerService.reset();
    logs = []; // Clear logs
    res.json({ success: true, message: 'Service reset' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get logs
app.get('/api/logs', (req, res) => {
  const { type, limit = 100 } = req.query;
  let filteredLogs = logs;
  
  if (type) {
    filteredLogs = logs.filter(log => log.type === type);
  }
  
  const limitNum = parseInt(limit);
  if (limitNum > 0) {
    filteredLogs = filteredLogs.slice(-limitNum);
  }
  
  res.json(filteredLogs);
});

// Export logs
app.get('/api/logs/export', (req, res) => {
  const { format = 'json' } = req.query;
  const filename = `puppeteer-logs-${new Date().toISOString().split('T')[0]}`;
  
  if (format === 'txt') {
    const txtContent = logs.map(log => 
      `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.txt"`);
    res.send(txtContent);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    res.json(logs);
  }
});

// Clear logs
app.delete('/api/logs', (req, res) => {
  logs = [];
  io.emit('logs', logs);
  res.json({ success: true, message: 'Logs cleared' });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Utility functions
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Web interface: http://localhost:${PORT}`);
});

module.exports = { app, server, io };