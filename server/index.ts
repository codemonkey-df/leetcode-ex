import express from 'express';
import cors from 'cors';
import sandboxRoutes from './api/sandbox.js';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/sandbox', sandboxRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Python Sandbox Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
