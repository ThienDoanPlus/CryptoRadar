import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import healthHandler from './api/health.js';
import verdictsHandler from './api/verdicts.js';
import forexfactoryHandler from './api/forexfactory.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Endpoints
app.all('/api/health', (req, res) => healthHandler(req, res));
app.all('/api/verdicts', (req, res) => verdictsHandler(req, res));
app.all('/api/forexfactory', (req, res) => forexfactoryHandler(req, res));

// Serve Frontend (Vite dist)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CryptoRadar Pro Server is running on port ${PORT}`);
  console.log(`📡 Health Check for UptimeRobot: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  TiDB Verdicts API: http://localhost:${PORT}/api/verdicts`);
});
