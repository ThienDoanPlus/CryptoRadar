import React, { useEffect, useState } from 'react';
import { X, Database, Clock, ArrowUpRight, ArrowDownRight, PauseCircle, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface StoredVerdict {
  id: string;
  symbol: string;
  price?: number;
  decision: 'LONG' | 'SHORT' | 'WAIT';
  confidence?: number;
  summary?: string;
  entry_zone?: string;
  stop_loss?: string;
  take_profit?: string;
  model_used?: string;
  created_at?: string;
}

interface TidbHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSymbol?: string;
}

export const TidbHistoryModal: React.FC<TidbHistoryModalProps> = ({
  isOpen,
  onClose,
  currentSymbol = 'ALL',
}) => {
  const [verdicts, setVerdicts] = useState<StoredVerdict[]>([]);
  const [filterSymbol, setFilterSymbol] = useState<string>(currentSymbol);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string } | null>(null);

  const fetchVerdicts = async () => {
    setIsLoading(true);
    try {
      // 1. Kiểm tra health
      const healthRes = await fetch('/api/health').then((r) => r.json()).catch(() => null);
      if (healthRes?.database) {
        setDbStatus({
          connected: healthRes.database.connected,
          message: healthRes.database.message,
        });
      }

      // 2. Tải lịch sử
      const url = filterSymbol === 'ALL' ? '/api/verdicts?limit=30' : `/api/verdicts?symbol=${filterSymbol}&limit=30`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setVerdicts(json.data || []);
      }
    } catch (err) {
      console.warn('Không thể tải lịch sử từ TiDB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVerdicts();
    }
  }, [isOpen, filterSymbol]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0b101c] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0d1627] to-[#0a0f1d] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Lịch Sử Chẩn Đoán Lệnh AI</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  TiDB Cloud Serverless
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Nhật ký các lần mô hình LLM phân tích số liệu 5 trụ cột và đưa ra tín hiệu vào lệnh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchVerdicts}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Database Status Alert Bar */}
        <div className="px-6 py-2.5 bg-[#090d18] border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {dbStatus?.connected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium">TiDB Cloud: Đã kết nối</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 font-medium">
                  {dbStatus?.message || 'Chưa cấu hình DATABASE_URL (TiDB Cloud)'}
                </span>
              </>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            {['ALL', 'BTC', 'ETH', 'SOL', 'XRP'].map((sym) => (
              <button
                key={sym}
                onClick={() => setFilterSymbol(sym)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  filterSymbol === sym
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Đang truy vấn lịch sử từ TiDB Cloud Serverless...</p>
            </div>
          ) : verdicts.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto space-y-3">
              <Database className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-200">Chưa có lịch sử chẩn đoán nào</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Khi bạn bấm nút <span className="text-emerald-400 font-medium">"Chẩn Đoán Ngay"</span> ở màn hình chính,
                kết quả phân tích (Long/Short, Stop Loss, Take Profit) sẽ được tự động lưu vĩnh viễn vào TiDB Cloud Serverless.
              </p>
            </div>
          ) : (
            verdicts.map((item) => {
              const isLong = item.decision === 'LONG';
              const isShort = item.decision === 'SHORT';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm tracking-wide">{item.symbol}</span>
                      {item.price && (
                        <span className="text-xs font-mono text-slate-400">
                          @ ${item.price.toLocaleString()}
                        </span>
                      )}

                      {/* Decision Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isLong
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60'
                            : isShort
                            ? 'bg-rose-950/80 text-rose-300 border-rose-600/60'
                            : 'bg-amber-950/80 text-amber-300 border-amber-600/60'
                        }`}
                      >
                        {isLong ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : isShort ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <PauseCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{item.decision}</span>
                      </span>

                      {item.confidence && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          Tin cậy: <b className="text-slate-200">{item.confidence}%</b>
                        </span>
                      )}
                    </div>

                    {item.summary && (
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {item.summary}
                      </p>
                    )}

                    {/* Trade Levels */}
                    {(item.entry_zone || item.stop_loss || item.take_profit) && (
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono pt-1">
                        {item.entry_zone && (
                          <span className="text-slate-400">
                            Entry: <span className="text-slate-200">{item.entry_zone}</span>
                          </span>
                        )}
                        {item.stop_loss && (
                          <span className="text-rose-400">
                            SL: <span className="text-rose-300">{item.stop_loss}</span>
                          </span>
                        )}
                        {item.take_profit && (
                          <span className="text-emerald-400">
                            TP: <span className="text-emerald-300">{item.take_profit}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="sm:text-right shrink-0 space-y-1">
                    <div className="flex items-center sm:justify-end gap-1 text-[11px] text-slate-500 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : 'Vừa xong'}</span>
                    </div>
                    {item.model_used && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        Model: {item.model_used.replace('openai/', '').replace('qwen/', '')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0d1527] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>TiDB Serverless: 5GB miễn phí trọn đời (MySQL Compatible)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
