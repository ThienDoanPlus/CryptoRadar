import { getRecentVerdictsFromTiDB, saveVerdictToTiDB } from './_tidb.js';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Lấy danh sách lịch sử chẩn đoán từ TiDB
  if (req.method === 'GET') {
    try {
      const symbol = req.query?.symbol || undefined;
      const limit = Number(req.query?.limit) || 20;

      const verdicts = await getRecentVerdictsFromTiDB(symbol, limit);
      return res.status(200).json({
        success: true,
        count: verdicts.length,
        data: verdicts,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Lỗi truy vấn TiDB: ${error?.message || error}`,
        data: [],
      });
    }
  }

  // POST: Lưu chẩn đoán mới vào TiDB
  if (req.method === 'POST') {
    try {
      const payload = req.body;
      if (!payload || !payload.decision) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu verdict không hợp lệ (thiếu decision hoặc payload)',
        });
      }

      const verdictData = {
        id: payload.id || `verdict_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        symbol: payload.symbol || 'BTC',
        price: payload.price,
        decision: payload.decision,
        confidence: payload.confidence,
        summary: payload.summary,
        entry_zone: payload.entryZone,
        stop_loss: payload.stopLoss,
        take_profit: payload.takeProfit,
        model_used: payload.modelUsed,
        raw_analysis: payload.rawAnalysis || (typeof payload.reasoning === 'string' ? payload.reasoning : JSON.stringify(payload.reasoning || {})),
      };

      const result = await saveVerdictToTiDB(verdictData);
      return res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Lỗi lưu vào TiDB: ${error?.message || error}`,
      });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
