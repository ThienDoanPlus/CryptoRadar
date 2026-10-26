import React, { useState, useEffect } from 'react';
import {
  analyzeMarketWithGroq,
  getSavedGroqApiKey,
  getSavedGroqModel,
  saveGroqModel,
  AVAILABLE_GROQ_MODELS,
  MarketPayload,
  isGroqApiKeyFromEnv,
} from '../../services/aiAnalystService';
import { GroqModelId, TradingVerdict } from '../../types/cryptoRadar';
import { Badge } from '../ui/Badge';
import {
  Bot,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  PauseCircle,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Cpu,
  Compass,
  Database,
} from 'lucide-react';
import { TidbHistoryModal } from '../modals';

interface AiTradingVerdictCardProps {
  payload: MarketPayload;
  isCompact?: boolean;
}

export const AiTradingVerdictCard: React.FC<AiTradingVerdictCardProps> = ({
  payload,
  isCompact = false,
}) => {
  const [verdict, setVerdict] = useState<TradingVerdict | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GroqModelId>(() => getSavedGroqModel());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Reset verdict and error when user switches to a different asset
  useEffect(() => {
    setVerdict(null);
    setError(null);
  }, [payload.symbol]);

  const currentApiKey = getSavedGroqApiKey();
  const currentModelMeta =
    AVAILABLE_GROQ_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_GROQ_MODELS[0];

  const handleRunAnalysis = async () => {
    if (!currentApiKey) {
      setError(
        'Chưa cấu hình API Key trong file .env! Vui lòng mở file .env tại thư mục gốc và điền: VITE_GROQ_API_KEY="gsk_..." rồi bấm lại Chẩn Đoán Ngay.'
      );
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisStep('Đang tổng hợp số liệu 5 trụ cột thời gian thực...');

    const timer1 = setTimeout(() => {
      setAnalysisStep('Đang gửi payload qua Groq OpenAI API...');
    }, 400);

    const timer2 = setTimeout(() => {
      setAnalysisStep(`Mô hình ${currentModelMeta.name} đang chẩn đoán bẫy thanh lý & tỷ lệ R:R cho ${payload.symbol}...`);
    }, 1000);

    try {
      const res = await analyzeMarketWithGroq(payload, currentApiKey, selectedModel);
      setVerdict(res);
      if (res.modelUsed && res.modelUsed !== selectedModel) {
        setSelectedModel(res.modelUsed as GroqModelId);
      }

      // Tự động lưu lịch sử chẩn đoán vào TiDB Cloud Serverless ở chế độ nền
      fetch('/api/verdicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: payload.symbol,
          price: payload.price,
          decision: res.action === 'HOLD_CASH' ? 'WAIT' : res.action,
          confidence: res.confidenceScore,
          summary: res.summaryHeadline,
          entryZone: res.entryRange,
          stopLoss: res.stopLoss,
          takeProfit: res.takeProfit,
          modelUsed: res.modelUsed || selectedModel,
          rawAnalysis: res.detailedAnalysis,
        }),
      }).catch(() => {});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const formattedPrice = payload.price >= 10 ? `$${payload.price.toLocaleString()}` : `$${payload.price.toFixed(4)}`;

  return (
    <div className="bg-[#0b101c] border border-slate-700/90 rounded-xl overflow-hidden shadow-xl transition-all">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0d1527] to-[#090e18] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800/90 text-emerald-400 rounded-xl border border-slate-700/80 shadow-inner">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>AI Chẩn Đoán Lệnh {payload.symbol} Chuyên Sâu</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 font-mono">
                  Groq LPU
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Phân tích chéo số liệu 5 trụ cột ({payload.symbol}: {formattedPrice}) để đưa ra quyết định vào lệnh (Long / Short) hoặc Đứng ngoài
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Nút Xem Lịch Sử TiDB Cloud */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="px-2.5 py-1.5 bg-[#070a10] hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Xem lịch sử các lần chẩn đoán đã lưu trong TiDB Cloud Serverless"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Lịch Sử TiDB</span>
          </button>

          {/* Model Selector Dropdown */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#070a10] border border-slate-700/80 rounded-lg">
            <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedModel}
              onChange={(e) => {
                const newModel = e.target.value as GroqModelId;
                setSelectedModel(newModel);
                saveGroqModel(newModel);
              }}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
              title="Chọn Model Phân Tích"
            >
              {AVAILABLE_GROQ_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#0b101c] text-white">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-emerald-200' : 'text-emerald-300'}`} />
            <span>{isAnalyzing ? `Đang Phân Tích ${payload.symbol}...` : verdict ? `Phân Tích Lại ${payload.symbol}` : `Chẩn Đoán ${payload.symbol} Ngay`}</span>
          </button>
        </div>
      </div>

      {/* Analyzing Scanning State */}
      {isAnalyzing && (
        <div className="p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 animate-pulse">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Groq AI Đang Phân Tích Đa Chiều 5 Trụ Cột Cho {payload.symbol}</div>
            <div className="text-xs text-slate-400 font-mono mt-1">{analysisStep}</div>
          </div>
          <div className="max-w-md mx-auto w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full animate-progress" style={{ width: '75%' }} />
          </div>
        </div>
      )}

      {/* Error Notice */}
      {error && !isAnalyzing && (
        <div className="m-4 p-3.5 bg-rose-950/30 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong>Thông báo cấu hình:</strong> {error}
          </div>
        </div>
      )}

      {/* Initial Empty State Prompt */}
      {!verdict && !isAnalyzing && !error && (
        <div className="p-6 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-slate-800/60 border border-slate-700/80 text-slate-300">
            <Bot className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-white">
            Sẵn Sàng Chẩn Đoán Lệnh {payload.symbol} Cùng Mô Hình {currentModelMeta.name}
          </h3>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
            AI sẽ nạp trực tiếp số liệu thời gian thực của <strong>{payload.symbol}</strong>: Giá Spot {formattedPrice}, Coinbase Premium ({payload.coinbasePremium >= 0 ? `+${payload.coinbasePremium}%` : `${payload.coinbasePremium}%`}), Funding Rate (+{payload.fundingRate}%), Tỷ lệ Long/Short ({payload.longRatio}%/{payload.shortRatio}%), và các trụ cột vĩ mô để đưa ra chẩn đoán chính xác: <strong>VÀO LỆNH HAY ĐỨNG NGOÀI</strong>.
          </p>
          <div className="pt-2">
            <button
              onClick={handleRunAnalysis}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg text-xs transition-all shadow-md inline-flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Bấm Để Chẩn Đoán Lệnh {payload.symbol}</span>
            </button>
          </div>
        </div>
      )}

      {/* Completed Verdict Display */}
      {verdict && !isAnalyzing && (
        <div className="p-5 sm:p-6 space-y-5">
          {/* Main Action Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              verdict.action === 'LONG'
                ? 'bg-[#0f1d18] border-emerald-700/60 shadow-lg'
                : verdict.action === 'SHORT'
                ? 'bg-[#221217] border-rose-700/60 shadow-lg'
                : 'bg-[#181920] border-slate-700/80 shadow-md'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  verdict.action === 'LONG'
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    : verdict.action === 'SHORT'
                    ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                    : 'bg-slate-800 border-slate-600 text-slate-300'
                }`}
              >
                {verdict.action === 'LONG' ? (
                  <ArrowUpRight className="w-7 h-7 text-emerald-300 stroke-[2.5]" />
                ) : verdict.action === 'SHORT' ? (
                  <ArrowDownRight className="w-7 h-7 text-rose-300 stroke-[2.5]" />
                ) : (
                  <PauseCircle className="w-7 h-7 text-slate-300 stroke-[2.5]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg sm:text-xl font-black tracking-tight ${
                      verdict.action === 'LONG'
                        ? 'text-emerald-300'
                        : verdict.action === 'SHORT'
                        ? 'text-rose-300'
                        : 'text-slate-100'
                    }`}
                  >
                    {verdict.actionLabel}
                  </span>
                  <Badge tone={verdict.action === 'LONG' ? 'bullish' : verdict.action === 'SHORT' ? 'bearish' : 'neutral'}>
                    ĐỘ TIN CẬY {verdict.confidenceScore}%
                  </Badge>
                </div>
                <p className="text-xs text-slate-200 mt-1 font-medium leading-relaxed">
                  {verdict.summaryHeadline}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">Thời gian chẩn đoán:</span>
              <span className="text-xs text-slate-300 font-mono-numbers font-semibold">
                {verdict.timestamp} (Live)
              </span>
            </div>
          </div>

          {/* Strategic Trade Execution Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-[#070a10] border border-slate-800 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Vùng Vào Lệnh (Entry)
              </span>
              <div className="text-sm font-bold font-mono-numbers text-white mt-1">
                {verdict.entryRange}
              </div>
              <span className="text-[10px] text-slate-500">Quanh giá Spot hiện tại</span>
            </div>

            <div className="p-3 bg-[#070a10] border border-slate-800 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-rose-400 block">
                Cắt Lỗ (Stop Loss)
              </span>
              <div className="text-sm font-bold font-mono-numbers text-rose-300 mt-1">
                {verdict.stopLoss}
              </div>
              <span className="text-[10px] text-slate-500">Dưới bẫy thanh lý MM</span>
            </div>

            <div className="p-3 bg-[#070a10] border border-slate-800 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-emerald-400 block">
                Chốt Lời (Take Profit)
              </span>
              <div className="text-sm font-bold font-mono-numbers text-emerald-300 mt-1">
                {verdict.takeProfit}
              </div>
              <span className="text-[10px] text-slate-500">Vùng Short Squeeze</span>
            </div>

            <div className="p-3 bg-[#070a10] border border-slate-800 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Tỷ Lệ Risk / Reward (R:R)
              </span>
              <div className="text-sm font-bold font-mono-numbers text-slate-100 mt-1">
                {verdict.riskRewardRatio}
              </div>
              <span className="text-[10px] text-emerald-400">Đạt chuẩn quỹ phòng hộ</span>
            </div>
          </div>

          {/* 5-Pillar Confluence Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5 p-4 bg-[#070a10]/60 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Căn Cứ Định Lượng Vào Lệnh:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {verdict.keyReasons.map((reason, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="text-slate-200">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2.5 p-4 bg-[#070a10]/60 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Rủi Ro Cần Phòng Vệ:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {verdict.riskWarnings.map((warn, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="text-rose-200/90">{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Accordion Deep Dive Analysis */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#070a10]/40">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Xem Báo Cáo Phân Tích Chuyên Sâu Của Giám Đốc Định Lượng</span>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 whitespace-pre-line space-y-2">
                {verdict.detailedAnalysis}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TiDB Cloud History Modal */}
      <TidbHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentSymbol={payload.symbol}
      />
    </div>
  );
};
