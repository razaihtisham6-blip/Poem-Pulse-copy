const express = require('express');
const http = require('http');

// Use global fetch if available (Node 18+), otherwise fallback to node-fetch v2
const fetchFn = (typeof fetch === 'function') ? fetch : (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const app = express();
app.use(express.json({ limit: '5mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Analyze endpoint -> forwards to local Ollama
app.post('/api/analyze', async (req, res) => {
  try {
    const { text, model = 'llama3:8b' } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing required field: text' });
    }

    const prompt = `Analyze this writing and return concise insights:\n- Key themes\n- Tone and sentiment\n- Style and notable devices\n- One actionable suggestion\n\nText:\n${text}`;

    let ollamaResponse;
    try {
      ollamaResponse = await fetchFn('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: false })
      });
    } catch (err) {
      // Typically occurs when Ollama is not running
      return res.status(502).json({ error: 'Ollama not reachable on 127.0.0.1:11434' });
    }

    if (!ollamaResponse.ok) {
      const errText = await ollamaResponse.text().catch(() => '');
      return res.status(502).json({ error: 'Ollama error', detail: errText });
    }

    const data = await ollamaResponse.json();
    return res.json({ result: data.response || '' });
  } catch (error) {
    console.error('Analyze error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Shutdown endpoint
app.post('/api/shutdown', (req, res) => {
  console.log('Received shutdown request');
  res.json({ message: 'Shutting down server...' });
  
  // Close the server gracefully
  setTimeout(() => {
    console.log('Server shutting down...');
    process.exit(0);
  }, 1000); // Give time for response to be sent
});

const PORT = 3001;
const HOST = '127.0.0.1'; // Bind to localhost only (no LAN exposure)
const server = http.createServer(app);
server.listen(PORT, HOST, () => {
  console.log(`API listening on http://${HOST}:${PORT}`);
});


