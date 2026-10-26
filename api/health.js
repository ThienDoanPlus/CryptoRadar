import { checkDatabaseHealth } from './_tidb.js';

export default async function handler(req, res) {
  if (!res.status) {
    res.status = (statusCode) => {
      res.statusCode = statusCode;
      return res;
    };
  }
  if (!res.json) {
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const dbHealth = await checkDatabaseHealth();

    const responsePayload = {
      status: 'ok',
      service: 'CryptoRadar Pro Backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
      database: {
        provider: 'TiDB Cloud Serverless',
        connected: dbHealth.connected,
        message: dbHealth.message,
        latencyMs: dbHealth.latencyMs,
      },
    };

    return res.status(200).json(responsePayload);
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Lỗi kiểm tra trạng thái hệ thống',
      timestamp: new Date().toISOString(),
    });
  }
}
