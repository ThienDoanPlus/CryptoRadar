import React, { useState, useEffect } from 'react';
import { TabId, MacroEvent } from '../../types/cryptoRadar';
import { fetchLiveMarketData, LiveCoinStats, roundPrice } from '../../services/liveMarketService';
import { fetchLiveEtfFlows, LiveEtfOverview } from '../../services/etfService';
import { fetchLiveMacroEvents } from '../../services/macroService';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AiTradingVerdictCard } from '../ai/AiTradingVerdictCard';
import { MarketPayload } from '../../services/aiAnalystService';
import {
  Flame,
  Zap,
  Landmark,
  Clock,
  Unlock,
  ArrowRight,
  TrendingUp,
  Target,
  ExternalLink,
  CheckCircle2,
  Compass,
  Radio,
  Coins,
} from 'lucide-react';

interface OverviewExecutiveProps {
  onSelectTab: (tab: TabId) => void;
  onOpenRoutine: () => void;
  onOpenPortals: () => void;
  streakDays: number;
  isCompact?: boolean;
}

const SUPPORTED_COINS = [
  { symbol: 'BTC', name: 'Bitcoin', defaultPrice: 80200 },
  { symbol: 'ETH', name: 'Ethereum', defaultPrice: 2320 },
  { symbol: 'SOL', name: 'Solana', defaultPrice: 101.5 },
  { symbol: 'XRP', name: 'Ripple', defaultPrice: 1.48 },
];

export const OverviewExecutive: React.FC<OverviewExecutiveProps> = ({
  onSelectTab,
  onOpenRoutine,
  onOpenPortals,
  streakDays,
  isCompact = false,
}) => {
  const [selectedCoin, setSelectedCoin] = useState<string>('BTC');
  const [liveCoins, setLiveCoins] = useState<Record<string, LiveCoinStats>>({});
  const [etfOverview, setEtfOverview] = useState<LiveEtfOverview | null>(null);
  const [macroEvents, setMacroEvents] = useState<MacroEvent[]>([]);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [marketRes, etfRes, macroRes] = await Promise.all([
          fetchLiveMarketData(),
          fetchLiveEtfFlows(),
          fetchLiveMacroEvents(),
        ]);
        if (isMounted) {
          if (marketRes.isLiveConnected) {
            setLiveCoins(marketRes.coins);
            setIsLiveConnected(true);
          }
          setEtfOverview(etfRes);
          if (Array.isArray(macroRes) && macroRes.length > 0) {
            setMacroEvents(macroRes);
          }
        }
      } catch (err) {
        console.warn('Overview live fetch warning:', err);
      }
    }

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const currentCoinMeta = SUPPORTED_COINS.find((c) => c.symbol === selectedCoin) || SUPPORTED_COINS[0];
  const activeStats = liveCoins[selectedCoin];
  const activePrice = activeStats?.price ?? currentCoinMeta.defaultPrice;
  const activeChange = activeStats?.change24h ?? 2.1;
  const activeCbPremium = activeStats?.coinbasePremium ?? (selectedCoin === 'BTC' ? 0.082 : 0.045);
  const activeFunding = activeStats?.fundingRate ?? 0.0094;
  const activeOI = activeStats?.openInterestUSD ?? (selectedCoin === 'BTC' ? 39.4 : selectedCoin === 'ETH' ? 12.8 : selectedCoin === 'SOL' ? 3.2 : 2.1);
  const activeLong = activeStats?.longRatio ?? 52.8;
  const activeShort = activeStats?.shortRatio ?? 47.2;
  const latestEtfNet = etfOverview?.latestDayNetUsdMillion ?? 423.2;

  const topLongPrice = roundPrice(activePrice * 0.965);
  const topShortPrice = roundPrice(activePrice * 1.042);

  const formatPrice = (p: number) => {
    if (p >= 1000) return `$${p.toLocaleString()}`;
    if (p >= 10) return `$${p.toFixed(2)}`;
    return `$${p.toFixed(4)}`;
  };

  let coinUnlockSummary = 'Cung lưu hành BTC ổn định (trên 19.8 triệu BTC đã khai thác, lạm phát sau Halving chỉ ~0.8%/năm).';
  if (selectedCoin === 'ETH') {
    coinUnlockSummary = 'Nguồn cung ETH phát hành qua PoS giảm phát nhẹ. Áp lực bán từ unstake validator ở mức thấp ổn định.';
  } else if (selectedCoin === 'SOL') {
    coinUnlockSummary = 'Lịch mở khóa staking & validator SOL giải phóng định kỳ theo từng epoch (~2-3 ngày/epoch).';
  } else if (selectedCoin === 'XRP') {
    coinUnlockSummary = 'Ripple mở khóa ký quỹ 1 tỷ XRP định kỳ hàng tháng, phần lớn ~700-800 triệu XRP được khóa lại vào escrow.';
  }

  // Lấy động danh sách các sự kiện vĩ mô Thẻ Đỏ (High Impact) sắp tới trực tiếp từ ForexFactory API
  const upcomingHighEvents = macroEvents.filter((e) => !e.hasPassed && e.impact === 'high');
  const upcomingRedMacroEvents = (upcomingHighEvents.length > 0 ? upcomingHighEvents : macroEvents.filter((e) => e.impact === 'high'))
    .slice(0, 3)
    .map((e) => `${e.title} (${e.country} ${e.timeDisplayVn.replace(' (VN)', '')})`);

  const nextMacro = upcomingHighEvents[0] || macroEvents.find((e) => !e.hasPassed);
  let nextMacroCountdown = '--:--:--';
  if (nextMacro) {
    const diffMs = Math.max(0, new Date(nextMacro.scheduledTime).getTime() - Date.now());
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
    nextMacroCountdown = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const marketPayload: MarketPayload = {
    symbol: selectedCoin,
    price: activePrice,
    change24h: activeChange,
    coinbasePremium: activeCbPremium,
    fundingRate: activeFunding,
    openInterestBillion: activeOI,
    longRatio: activeLong,
    shortRatio: activeShort,
    topLongLiquidationPrice: topLongPrice,
    topShortLiquidationPrice: topShortPrice,
    totalCorporateBtc: selectedCoin === 'BTC' ? 1303574 : 0,
    totalCorporateUsd: selectedCoin === 'BTC' ? 104496820192 : 0,
    mempoolPendingTxs: 39988,
    latestEtfNetflowMillion: latestEtfNet,
    totalEtfCumulativeMillion: etfOverview?.totalCumulativeUsdMillion ?? 21450.8,
    upcomingRedMacroEvents: upcomingRedMacroEvents.length > 0 ? upcomingRedMacroEvents : [
      'Đang đồng bộ máy chủ ForexFactory...',
    ],
    nextMacroCountdown,
    tokenUnlocksRiskSummary: coinUnlockSummary,
  };

  const getStrategicBrief = () => {
    if (selectedCoin === 'BTC') {
      return (
        <>
          <strong>Bản tin chiến lược BTC:</strong> Lực mua thật từ Phố Wall đang tích cực (ETF nạp <strong>+${latestEtfNet}M</strong>, Coinbase Premium <strong>{activeCbPremium >= 0 ? `+${activeCbPremium}%` : `${activeCbPremium}%`}</strong>, các tổ chức định chế nắm giữ trên <strong>1.3M BTC</strong>). Cụm thanh lý Short tại <strong>{formatPrice(topShortPrice)}</strong>, Long tại <strong>{formatPrice(topLongPrice)}</strong>.
        </>
      );
    }
    if (selectedCoin === 'ETH') {
      return (
        <>
          <strong>Bản tin chiến lược ETH:</strong> Tỷ lệ tài khoản Long/Short là <strong>{activeLong}% / {activeShort}%</strong>, Coinbase Premium <strong>{activeCbPremium >= 0 ? `+${activeCbPremium}%` : `${activeCbPremium}%`}</strong>. Dòng tiền Spot ETF ETH và nâng cấp hạ tầng đang tạo đà tích lũy. Cụm thanh lý Short tại <strong>{formatPrice(topShortPrice)}</strong>, Long tại <strong>{formatPrice(topLongPrice)}</strong>.
        </>
      );
    }
    if (selectedCoin === 'SOL') {
      return (
        <>
          <strong>Bản tin chiến lược SOL:</strong> Funding Rate <strong>{activeFunding >= 0 ? `+${activeFunding}%` : `${activeFunding}%`}</strong>, Open Interest đạt <strong>${activeOI}B</strong>. Biến động thanh lý vùng Long tại <strong>{formatPrice(topLongPrice)}</strong> và Short tại <strong>{formatPrice(topShortPrice)}</strong>. Hãy cẩn trọng râu quét biến động cao.
        </>
      );
    }
    return (
      <>
        <strong>Bản tin chiến lược XRP:</strong> Tỷ lệ tài khoản Long <strong>{activeLong}%</strong>, Funding Rate <strong>{activeFunding >= 0 ? `+${activeFunding}%` : `${activeFunding}%`}</strong>. Biến động ngắn hạn quanh hỗ trợ <strong>{formatPrice(topLongPrice)}</strong> và kháng cự <strong>{formatPrice(topShortPrice)}</strong>.
      </>
    );
  };

  return (
    <div className={isCompact ? 'space-y-3' : 'space-y-6'}>
      <Card isCompact={isCompact} className="border-slate-800">
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between ${isCompact ? 'gap-4' : 'gap-6'}`}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge tone="neutral">TỔNG HỢP 5 TRỤ CỘT THỊ TRƯỜNG HÔM NAY</Badge>
              {isLiveConnected && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  Live API Feed
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono-numbers">
                Cập nhật: {new Date().toLocaleDateString('vi-VN')}
              </span>
            </div>

            <h1 className={`font-bold text-white tracking-tight ${isCompact ? 'text-lg sm:text-xl' : 'text-2xl'}`}>
              Chuyển Từ "Nghe Tin Tức Bị Động" Sang{' '}
              <span className="text-slate-100 font-bold border-b border-slate-600 pb-0.5">
                Quan Sát Số Liệu Trực Quan
              </span>
            </h1>

            {!isCompact && (
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Phân định rõ ràng đâu là <strong>"bẫy thanh khoản"</strong> của Cá voi, đâu là <strong>lực mua thật từ Phố Wall</strong> bằng 5 bộ công cụ trực quan miễn phí hàng đầu thế giới kết nối trực tiếp Live API.
              </p>
            )}
          </div>

          <div className="p-4 bg-[#0a0f1a] border border-slate-700/80 rounded-xl flex flex-col justify-between shrink-0 lg:w-80 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Quy Trình 5 Phút Mỗi Sáng</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-300 font-mono-numbers">
                <Flame className="w-3.5 h-3.5 text-slate-400" />
                <span>{streakDays} ngày</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              Dành đúng 5 phút mỗi sáng ngủ dậy để quét 4 bước: ETF → Tin Vĩ Mô → Bản đồ Thanh lý → Vẽ Alert biểu đồ.
            </p>

            <button
              onClick={onOpenRoutine}
              className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-600 font-medium text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <span>Bắt Đầu Quy Trình 5 Phút</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Asset Selection Pill Bar */}
        <div className={`border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isCompact ? 'mt-3 pt-3' : 'mt-5 pt-4'}`}>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
              Chọn tài sản quan sát & chẩn đoán AI:
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700/80">
              {selectedCoin} Đang chọn
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {SUPPORTED_COINS.map((c) => {
              const isSelected = selectedCoin === c.symbol;
              const stats = liveCoins[c.symbol];
              const price = stats?.price ?? c.defaultPrice;
              const change = stats?.change24h ?? (c.symbol === 'BTC' ? 2.1 : 1.5);
              return (
                <button
                  key={c.symbol}
                  onClick={() => setSelectedCoin(c.symbol)}
                  className={`rounded-lg text-xs transition-all whitespace-nowrap flex items-center gap-2 border px-3 py-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-white border-slate-500 font-semibold shadow-md ring-1 ring-slate-600'
                      : 'bg-[#090d16] text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-semibold text-slate-100">{c.symbol}</span>
                  <span className="text-[11px] font-mono-numbers text-slate-300">
                    {formatPrice(price)}
                  </span>
                  <span className={`text-[10px] font-mono-numbers ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {change >= 0 ? `+${change}%` : `${change}%`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Executive Market Verdict Banner */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Đánh Giá {selectedCoin}</span>
                <Badge tone={activeChange >= 0 ? 'bullish' : 'bearish'}>
                  {activeChange >= 0 ? 'Tăng 24h' : 'Giảm 24h'}
                </Badge>
              </div>
              <div className="text-sm font-bold text-emerald-300 font-mono-numbers">
                {currentCoinMeta.name} {formatPrice(activePrice)} ({activeChange >= 0 ? `+${activeChange}%` : `${activeChange}%`})
              </div>
            </div>
          </div>

          <div className="md:col-span-8 text-xs text-slate-300 leading-relaxed bg-[#0a0f1a]/80 p-3 rounded-lg border border-slate-800">
            {getStrategicBrief()}
          </div>
        </div>
      </Card>

      {/* Groq AI Trading Verdict Card */}
      <AiTradingVerdictCard
        payload={marketPayload}
        isCompact={isCompact}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            5 Trụ Cột Công Cụ Quan Sát Trực Quan
          </h2>
          <button
            onClick={onOpenPortals}
            className="text-xs text-slate-400 hover:text-white hover:underline flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>Xem Danh Bạ Web Chính Thức</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            onClick={() => onSelectTab('liquidation')}
            className="p-5 bg-[#0d131f] border border-slate-800 hover:border-slate-600 rounded-xl cursor-pointer transition-all hover:bg-[#121929] group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-slate-800/80 text-slate-300 rounded-lg border border-slate-700/80 group-hover:text-white transition-colors">
                <Zap className="w-4 h-4" />
              </div>
              <Badge tone="neutral">TRỤ CỘT 1</Badge>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-slate-100 transition-colors">
                Bản Đồ Thanh Khoản & Đòn Bẩy (Coinglass)
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Liquidation Heatmap, Coinbase Premium Index ({activeCbPremium >= 0 ? `+${activeCbPremium}%` : `${activeCbPremium}%`}), Funding Rate toàn sàn từ Binance API.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-mono-numbers">{selectedCoin}: {formatPrice(activePrice)}</span>
              <span className="text-slate-400 group-hover:text-slate-200 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-all">
                Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          <div
            onClick={() => onSelectTab('whales')}
            className="p-5 bg-[#0d131f] border border-slate-800 hover:border-slate-600 rounded-xl cursor-pointer transition-all hover:bg-[#121929] group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-slate-800/80 text-slate-300 rounded-lg border border-slate-700/80 group-hover:text-white transition-colors">
                <Target className="w-4 h-4" />
              </div>
              <Badge tone="neutral">TRỤ CỘT 2</Badge>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-slate-100 transition-colors">
                Soi Ví Cá Voi & Ví Chính Phủ Mỹ (Arkham)
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Theo dõi 208,109 BTC của Mỹ, MicroStrategy, CoinGecko Treasuries & lệnh cá voi Binance Live Feed.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-mono-numbers">Gom ròng On-chain</span>
              <span className="text-slate-400 group-hover:text-slate-200 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-all">
                Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          <div
            onClick={() => onSelectTab('etf')}
            className="p-5 bg-[#0d131f] border border-slate-800 hover:border-slate-600 rounded-xl cursor-pointer transition-all hover:bg-[#121929] group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-slate-800/80 text-slate-300 rounded-lg border border-slate-700/80 group-hover:text-white transition-colors">
                <Landmark className="w-4 h-4" />
              </div>
              <Badge tone="neutral">TRỤ CỘT 3</Badge>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-slate-100 transition-colors">
                Dòng Tiền ETF Phố Wall (Farside Investors)
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Dòng tiền Spot Bitcoin & Ethereum ETF từ BlackRock IBIT, Fidelity FBTC. Cập nhật chu kỳ NAV.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-mono-numbers font-semibold">+{latestEtfNet}M USD (Phiên gần nhất)</span>
              <span className="text-slate-400 group-hover:text-slate-200 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-all">
                Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          <div
            onClick={() => onSelectTab('macro')}
            className="p-5 bg-[#0d131f] border border-slate-800 hover:border-slate-600 rounded-xl cursor-pointer transition-all hover:bg-[#121929] group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-slate-800/80 text-slate-300 rounded-lg border border-slate-700/80 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
              </div>
              <Badge tone="neutral">TRỤ CỘT 4</Badge>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-slate-100 transition-colors">
                Lịch Tin Vĩ Mô Thẻ ĐỎ (ForexFactory)
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Đếm ngược từng giây đến các tin đỏ Mỹ (USD) từ ForexFactory Live Feed. Chuẩn múi giờ VN (GMT+7).
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-rose-300 font-mono-numbers font-medium">ForexFactory Live JSON</span>
              <span className="text-slate-400 group-hover:text-slate-200 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-all">
                Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          <div
            onClick={() => onSelectTab('unlocks')}
            className="p-5 bg-[#0d131f] border border-slate-800 hover:border-slate-600 rounded-xl cursor-pointer transition-all hover:bg-[#121929] group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-slate-800/80 text-slate-300 rounded-lg border border-slate-700/80 group-hover:text-white transition-colors">
                <Unlock className="w-4 h-4" />
              </div>
              <Badge tone="neutral">TRỤ CỘT 5</Badge>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-slate-100 transition-colors">
                Lịch Mở Khóa Token (Token Unlocks)
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Né các Altcoin sắp bị dự án và quỹ xả lớn (&gt;3%-5% cung) như TIA, ARB, SUI từ CoinGecko Live API.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-amber-300 font-mono-numbers font-medium">CoinGecko Market API</span>
              <span className="text-slate-400 group-hover:text-slate-200 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-all">
                Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          <div className="p-5 bg-[#0d131f] border border-slate-800 hover:border-slate-600 rounded-xl space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-slate-800/80 text-slate-300 rounded-lg border border-slate-700/80">
                <CheckCircle2 className="w-4 h-4 text-slate-300" />
              </div>
              <Badge tone="neutral">BƯỚC 4 QUY TRÌNH</Badge>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">
                Vẽ Vùng Cản & Đặt Alert TradingView
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Sau khi soi xong các trụ cột, mở Binance/TradingView để đánh dấu các vùng Hỗ trợ/Kháng cự On-chain rồi yên tâm làm việc.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <a
                href="https://www.tradingview.com/"
                target="_blank"
                rel="noreferrer noopener"
                className="text-slate-400 hover:text-white hover:underline flex items-center gap-1 transition-colors"
              >
                <span>Mở TradingView.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
