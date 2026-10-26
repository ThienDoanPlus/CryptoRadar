import { connect } from '@tidbcloud/serverless';

function getTiDBConnection() {
  const databaseUrl = process.env.DATABASE_URL || process.env.TIDB_DATABASE_URL;

  if (databaseUrl) {
    return connect({ url: databaseUrl });
  }

  const host = process.env.TIDB_HOST;
  const username = process.env.TIDB_USER;
  const password = process.env.TIDB_PASSWORD;
  const database = process.env.TIDB_DATABASE || 'cryptoradar';

  if (!host || !username || !password) {
    return null;
  }

  return connect({
    host,
    username,
    password,
    database,
  });
}

let tableInitialized = false;
export async function ensureTableInitialized() {
  if (tableInitialized) return;
  const conn = getTiDBConnection();
  if (!conn) return;

  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS ai_verdicts (
        id VARCHAR(64) PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL,
        price DECIMAL(18, 4),
        decision VARCHAR(20) NOT NULL,
        confidence INT,
        summary TEXT,
        entry_zone VARCHAR(100),
        stop_loss VARCHAR(100),
        take_profit VARCHAR(100),
        model_used VARCHAR(100),
        raw_analysis MEDIUMTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_symbol_created (symbol, created_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tableInitialized = true;
  } catch (err) {
    console.warn('Lưu ý: Không thể khởi tạo bảng TiDB tự động:', err?.message || err);
  }
}

export async function checkDatabaseHealth() {
  const conn = getTiDBConnection();
  if (!conn) {
    return {
      connected: false,
      message: 'Chưa cấu hình biến môi trường TiDB (DATABASE_URL hoặc TIDB_HOST/TIDB_USER/TIDB_PASSWORD)',
    };
  }

  const start = Date.now();
  try {
    await conn.execute('SELECT 1 as ping');
    return {
      connected: true,
      message: 'Kết nối TiDB Cloud Serverless thành công',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      connected: false,
      message: `Lỗi kết nối TiDB: ${error?.message || error}`,
    };
  }
}

export async function saveVerdictToTiDB(verdict) {
  const conn = getTiDBConnection();
  if (!conn) {
    return { success: false, message: 'TiDB chưa được cấu hình biến môi trường' };
  }

  await ensureTableInitialized();

  await conn.execute(
    `INSERT INTO ai_verdicts (
      id, symbol, price, decision, confidence, summary, entry_zone, stop_loss, take_profit, model_used, raw_analysis
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      decision = VALUES(decision),
      confidence = VALUES(confidence),
      summary = VALUES(summary);`,
    [
      verdict.id,
      verdict.symbol,
      verdict.price || null,
      verdict.decision,
      verdict.confidence || null,
      verdict.summary || null,
      verdict.entry_zone || null,
      verdict.stop_loss || null,
      verdict.take_profit || null,
      verdict.model_used || null,
      verdict.raw_analysis || null,
    ]
  );

  return { success: true };
}

export async function getRecentVerdictsFromTiDB(symbol, limit = 20) {
  const conn = getTiDBConnection();
  if (!conn) {
    return [];
  }

  await ensureTableInitialized();

  let query = 'SELECT * FROM ai_verdicts ORDER BY created_at DESC LIMIT ?';
  let params = [limit];

  if (symbol && symbol !== 'ALL') {
    query = 'SELECT * FROM ai_verdicts WHERE symbol = ? ORDER BY created_at DESC LIMIT ?';
    params = [symbol, limit];
  }

  const rows = await conn.execute(query, params);
  return rows || [];
}
